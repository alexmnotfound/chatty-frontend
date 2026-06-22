import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aiRoles, settings, type AiRole } from '../api';
import type { BotRules as BotRulesType, TabId } from '../components/bot-rules/types';
import { mockStats } from '../components/bot-rules/mockData';
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

function roleToRules(role: AiRole): BotRulesType {
  return {
    name: role.name,
    model: 'claude-sonnet-4-6',
    tone: 50,
    greeting: '',
    maxLength: 'short',
    businessHours: { enabled: false, days: 'Lun–Vie', from: '09:00', to: '18:00', tz: 'America/Argentina/Buenos_Aires' },
    humanHandoff: { enabled: false, team: '', activeAgents: 0 },
    instructions: role.systemPrompt ?? '',
    variables: extractVariables(role.systemPrompt ?? ''),
    examples: (role.examples ?? []).map(ex => ({
      id: ex.id,
      category: ex.title,
      userSays: ex.content,
      botReplies: '',
      status: 'learned' as const,
    })),
    files: (role.knowledgeFiles ?? []).map(f => ({
      id: f.id,
      name: f.originalName,
      kind: 'pdf' as const,
      sizeBytes: f.size,
      indexedAt: new Date(f.createdAt).toLocaleDateString('es-AR'),
      status: 'active' as const,
    })),
  };
}

export default function BotRules() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rules, setRules] = useState<BotRulesType | null>(null);
  const [roleId, setRoleId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabId>('parameters');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableProviders, setAvailableProviders] = useState<('openai' | 'claude')[]>([]);

  useEffect(() => {
    aiRoles.list().then(list => {
      const role = list.find((r: AiRole) => r.id === id);
      if (!role) { navigate('/bots', { replace: true }); return; }
      setRoleId(role.id);
      setRules(roleToRules(role));
    }).catch(() => setError('No se pudo cargar el bot.'));
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
      await aiRoles.update(roleId, { name: rules.name, systemPrompt: rules.instructions });
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
    parameters:   7,
    instructions: rules.variables.length,
    examples:     rules.examples.length,
    files:        rules.files.length,
  };

  return (
    <div className="br-main">
      <main className="br-page">
        {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</p>}
        <PageHeader botName={rules.name} onPublish={handlePublish} />
        <StatStrip stats={mockStats} />
        <TabBar active={activeTab} counts={counts} onChange={setActiveTab} />

        {activeTab === 'parameters'   && <ParametersSection   rules={rules} onChange={patch} availableProviders={availableProviders} />}
        {activeTab === 'instructions' && <InstructionsSection rules={rules} onChange={patch} />}
        {activeTab === 'examples'     && <ExamplesSection     examples={rules.examples} />}
        {activeTab === 'files'        && <FilesSection        files={rules.files} />}
      </main>

      <LivePreviewPanel botName={rules.name} />

      <div className="br-save-bar">
        <button className="br-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
