import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bots, settings, type Bot, type BotStats } from '../api';
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
  return {
    name: bot.name,
    model: (bot.aiModel as ModelId) ?? 'gpt-4o-mini',
    tone: (bot.tone as 'formal' | 'informal') ?? 'informal',
    gender: (bot.gender as BotRulesType['gender']) ?? 'neutral',
    greeting: bot.greeting ?? '',
    maxLength: bot.maxLength ?? 'short',
    businessHours: bot.businessHours ?? { enabled: false, days: 'Lun–Vie', from: '09:00', to: '18:00', tz: 'America/Argentina/Buenos_Aires' },
    humanHandoff: bot.humanHandoff ?? { enabled: false, team: '', activeAgents: 0 },
    instructions: bot.systemPrompt ?? '',
    variables: extractVariables(bot.systemPrompt ?? ''),
    examples: (bot.examples ?? []).map(ex => ({
      id: ex.id,
      category: '',
      userSays: ex.userMessage,
      botReplies: ex.botResponse,
      status: 'learned' as const,
    })),
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

  useEffect(() => {
    if (!id) { navigate('/bots', { replace: true }); return; }
    bots.get(id).then(bot => {
      setRules(botToRules(bot));
    }).catch(() => setError('No se pudo cargar el bot.'));
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
        businessHours: rules.businessHours,
        humanHandoff: rules.humanHandoff,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave();
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
        <PageHeader botName={rules.name} onPublish={handlePublish} />
        {stats && <StatStrip stats={stats} />}
        <TabBar active={activeTab} counts={counts} onChange={setActiveTab} />

        {activeTab === 'parameters'   && <ParametersSection   rules={rules} onChange={patch} availableProviders={availableProviders} />}
        {activeTab === 'instructions' && <InstructionsSection rules={rules} onChange={patch} />}
        {activeTab === 'examples'     && <ExamplesSection     examples={rules.examples} />}
        {activeTab === 'files'        && <FilesSection        files={rules.files} />}
      </main>

      <LivePreviewPanel botName={rules.name} botId={id!} systemPrompt={rules.instructions} />

      <div className="br-save-bar">
        <button className="br-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
