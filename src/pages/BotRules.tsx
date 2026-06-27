import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bots, botDocuments, settings, type Bot, type BotStats, type BotDocument } from '../api';
import type { BotFile } from '../components/bot-rules/types';
import type { BotRules as BotRulesType, ModelId, TabId } from '../components/bot-rules/types';
import { PageHeader } from '../components/bot-rules/PageHeader';
import { StatStrip } from '../components/bot-rules/StatStrip';
import { TabBar } from '../components/bot-rules/TabBar';
import { ParametersSection } from '../components/bot-rules/ParametersSection';
import { InstructionsSection } from '../components/bot-rules/InstructionsSection';
import { ExamplesSection } from '../components/bot-rules/ExamplesSection';
import { FilesSection } from '../components/bot-rules/FilesSection';
import { LivePreviewPanel } from '../components/bot-rules/LivePreviewPanel';
import '../components/bot-rules/BotRules.css';

function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\{\{([\w.]+)\}\}/g);
  return [...new Set([...matches].map(m => m[1]))];
}

function botToRules(bot: Bot): BotRulesType {
  // Supabase returns snake_case; Bot type is camelCase — access both to be safe
  const r = bot as unknown as Record<string, unknown>;
  const systemPrompt = (r.system_prompt ?? bot.systemPrompt ?? '') as string;
  const examples = ((r.examples ?? []) as Record<string, unknown>[]).map(ex => ({
    id: ex.id as string,
    category: '',
    userSays: (ex.user_message ?? ex.userMessage ?? '') as string,
    botReplies: (ex.bot_response ?? ex.botResponse ?? '') as string,
    status: 'learned' as const,
  }));
  return {
    name: bot.name,
    model: ((r.ai_model ?? bot.aiModel) as ModelId) ?? 'gpt-4o-mini',
    tone: ((r.tone ?? bot.tone) as 'formal' | 'informal') ?? 'informal',
    gender: ((r.gender ?? bot.gender) as BotRulesType['gender']) ?? 'neutral',
    greeting: ((r.greeting ?? bot.greeting) as string | null) ?? '',
    maxLength: ((r.max_length ?? bot.maxLength) as BotRulesType['maxLength'] | null) ?? 'short',
    businessHours: { enabled: ((r.business_hours ?? bot.businessHours) as { enabled?: boolean } | null)?.enabled ?? false },
    humanHandoff: ((r.human_handoff ?? bot.humanHandoff) as BotRulesType['humanHandoff'] | null)
      ?? { team: '', activeAgents: 0 },
    instructions: systemPrompt,
    variables: extractVariables(systemPrompt),
    examples,
    files: [],
  };
}

export default function BotRules() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rules, setRules] = useState<BotRulesType | null>(null);
  const [stats, setStats] = useState<BotStats | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('parameters');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableProviders, setAvailableProviders] = useState<('openai' | 'claude')[]>([]);
  const [uploading, setUploading] = useState(false);

  function docToFile(doc: BotDocument): BotFile {
    const d = new Date(doc.created_at);
    const indexedAt = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return {
      id: doc.id,
      name: doc.name,
      kind: doc.source_type,
      sizeBytes: doc.size_bytes ?? 0,
      indexedAt,
      status: doc.status === 'active' ? 'active' : doc.status === 'processing' ? 'processing' : doc.status === 'error' ? 'error' : 'review',
    };
  }

  useEffect(() => {
    if (!id) { navigate('/bots', { replace: true }); return; }
    bots.get(id).then(bot => {
      setRules(botToRules(bot));
    }).catch(() => setError('No se pudo cargar el bot.'));
    botDocuments.list(id).then(docs => {
      patch({ files: docs.map(docToFile) });
    }).catch(() => {});
    bots.stats(id).then(setStats).catch(() => {});
  }, [id, navigate]);

  useEffect(() => {
    settings.get().then((cfg) => {
      const providers: ('openai' | 'claude')[] = [];
      if (cfg.hasOpenAiApiKey) providers.push('openai');
      if (cfg.hasAnthropicApiKey) providers.push('claude');
      setAvailableProviders(providers);
    }).catch(() => {});
  }, []);

  const patch = (p: Partial<BotRulesType>) => setRules(prev => prev ? { ...prev, ...p } : prev);

  const handleSave = async () => {
    if (!rules) return;
    setSaving(true);
    setError('');
    try {
      await bots.update(id!, {
        name: rules.name,
        aiModel: rules.model,
        aiProvider: rules.model.startsWith('claude') ? 'claude' : 'openai',
        tone: rules.tone,
        gender: rules.gender,
        systemPrompt: rules.instructions,
        greeting: rules.greeting,
        maxLength: rules.maxLength,
        businessHours: { enabled: rules.businessHours?.enabled ?? false },
        humanHandoff: rules.humanHandoff,
        examples: rules.examples.map((ex, i) => ({
          userMessage: ex.userSays,
          botResponse: ex.botReplies,
          order: i,
        })),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!rules) return <p className="page-empty">{error || 'Cargando…'}</p>;

  const counts: Record<TabId, number> = {
    parameters:   0,
    instructions: rules.instructions ? 1 : 0,
    examples:     rules.examples.length,
    files:        rules.files.length,
  };

  return (
    <div className="br-main">
      <main className="br-page">
        {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</p>}
        <PageHeader botName={rules.name} />
        {stats && <StatStrip stats={stats} />}
        <TabBar active={activeTab} counts={counts} onChange={setActiveTab} />

        {activeTab === 'parameters'   && <ParametersSection   rules={rules} onChange={patch} availableProviders={availableProviders} />}
        {activeTab === 'instructions' && <InstructionsSection rules={rules} onChange={patch} />}
        {activeTab === 'examples'     && <ExamplesSection     examples={rules.examples} onChange={(ex) => patch({ examples: ex })} />}
        {activeTab === 'files'        && <FilesSection
          botId={id!}
          files={rules.files}
          uploading={uploading}
          onUpload={async (file) => {
            setUploading(true);
            try {
              const doc = await botDocuments.uploadFile(id!, file);
              patch({ files: [...(rules?.files ?? []), docToFile(doc)] });
            } finally {
              setUploading(false);
            }
          }}
          onDelete={async (docId) => {
            await botDocuments.delete(id!, docId);
            patch({ files: (rules?.files ?? []).filter(f => f.id !== docId) });
          }}
          onPasteText={async (text, name) => {
            setUploading(true);
            try {
              const doc = await botDocuments.pasteText(id!, text, name);
              patch({ files: [...(rules?.files ?? []), docToFile(doc)] });
            } finally {
              setUploading(false);
            }
          }}
        />}
      </main>

      <LivePreviewPanel
        botName={rules.name}
        botId={id!}
        systemPrompt={rules.instructions}
        greeting={rules.greeting || undefined}
        tone={rules.tone}
        gender={rules.gender}
        examples={rules.examples.map((ex, i) => ({
          userMessage: ex.userSays,
          botResponse: ex.botReplies,
          order: i,
        }))}
      />

      <div className="br-save-bar">
        <button className="br-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
