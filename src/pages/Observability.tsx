import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import SurfaceCard from '../components/ui/SurfaceCard';

interface DailyStats {
  date: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  message_count: number;
}

interface BotStats {
  bot_name: string;
  tokens_total: number;
  cost_usd: number;
}

interface ConversationRow {
  contact_name: string | null;
  bot_name: string | null;
  tokens_total: number;
  cost_usd: number;
  status: string;
  updated_at: string;
}

export default function Observability() {
  const { member } = useAuth();
  const [daily, setDaily] = useState<DailyStats[]>([]);
  const [byBot, setByBot] = useState<BotStats[]>([]);
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [totals, setTotals] = useState({ messages: 0, tokensIn: 0, tokensOut: 0, costUsd: 0, handoffRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member?.companyId) return;
    void loadStats();
  }, [member?.companyId]);

  async function loadStats() {
    const companyId = member!.companyId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [dailyRes, botRes, convRes, msgRes, convCountRes] = await Promise.all([
      supabase.rpc('observability_daily', { p_company_id: companyId, p_since: thirtyDaysAgo }),
      supabase.rpc('observability_by_bot', { p_company_id: companyId, p_since: startOfMonth }),
      supabase
        .from('conversations')
        .select('status, updated_at, contact:contacts(name, wa_id), active_bot:bots(name), messages(tokens_in, tokens_out, cost_usd)')
        .eq('company_id', companyId)
        .order('updated_at', { ascending: false })
        .limit(20),
      supabase.from('messages').select('tokens_in, tokens_out, cost_usd').eq('company_id', companyId).gte('created_at', startOfMonth),
      supabase.from('conversations').select('status').eq('company_id', companyId).gte('updated_at', startOfMonth),
    ]);

    setDaily((dailyRes.data ?? []) as DailyStats[]);
    setByBot((botRes.data ?? []) as BotStats[]);

    const convData = (convRes.data ?? []) as unknown as Array<{
      status: string;
      updated_at: string;
      contact: { name: string | null; wa_id: string } | null;
      active_bot: { name: string } | null;
      messages: Array<{ tokens_in: number | null; tokens_out: number | null; cost_usd: number | null }>;
    }>;
    setRows(convData.map(c => ({
      contact_name: c.contact?.name ?? c.contact?.wa_id ?? null,
      bot_name: c.active_bot?.name ?? null,
      tokens_total: c.messages.reduce((s, m) => s + (m.tokens_in ?? 0) + (m.tokens_out ?? 0), 0),
      cost_usd: c.messages.reduce((s, m) => s + Number(m.cost_usd ?? 0), 0),
      status: c.status,
      updated_at: c.updated_at,
    })));

    const msgs = msgRes.data ?? [];
    const convCount = convCountRes.data ?? [];
    const humanCount = convCount.filter((c: { status: string }) => c.status === 'human').length;
    setTotals({
      messages: msgs.length,
      tokensIn: msgs.reduce((s: number, m: { tokens_in: number | null }) => s + (m.tokens_in ?? 0), 0),
      tokensOut: msgs.reduce((s: number, m: { tokens_out: number | null }) => s + (m.tokens_out ?? 0), 0),
      costUsd: msgs.reduce((s: number, m: { cost_usd: number | null }) => s + Number(m.cost_usd ?? 0), 0),
      handoffRate: convCount.length ? Math.round((humanCount / convCount.length) * 100) : 0,
    });
    setLoading(false);
  }

  const maxDaily = Math.max(...daily.map(d => (d.tokens_in ?? 0) + (d.tokens_out ?? 0)), 1);

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Cargando...</div>;

  const kpis = [
    { label: 'Mensajes (mes)', value: totals.messages.toLocaleString('es-AR'), sub: undefined },
    {
      label: 'Tokens totales',
      value: (totals.tokensIn + totals.tokensOut).toLocaleString('es-AR'),
      sub: `in: ${totals.tokensIn.toLocaleString('es-AR')} / out: ${totals.tokensOut.toLocaleString('es-AR')}`,
    },
    { label: 'Costo estimado', value: `$${totals.costUsd.toFixed(2)}`, sub: undefined },
    { label: 'Tasa de handoff', value: `${totals.handoffRate}%`, sub: '% conv. → humano' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h2 style={{ marginBottom: '4px' }}>Observabilidad</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        Consumo de tus bots este mes.
      </p>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {kpis.map(kpi => (
          <SurfaceCard key={kpi.label} flush>
            <div style={{ padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>{kpi.value}</div>
              {kpi.sub && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{kpi.sub}</div>
              )}
            </div>
          </SurfaceCard>
        ))}
      </div>

      {/* Chart + By bot */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <SurfaceCard flush>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>
              Tokens por día (30 días)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
              {daily.length === 0 ? (
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin datos</span>
              ) : (
                daily.map((d, i) => {
                  const total = (d.tokens_in ?? 0) + (d.tokens_out ?? 0);
                  const h = (total / maxDaily) * 100;
                  return (
                    <div
                      key={i}
                      title={`${d.date}: ${total} tokens`}
                      style={{
                        flex: 1,
                        background: 'var(--accent)',
                        opacity: 0.7,
                        borderRadius: '2px 2px 0 0',
                        height: `${Math.max(h, 2)}%`,
                        minHeight: '2px',
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard flush>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>
              Por bot (mes)
            </div>
            {byBot.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin datos</span>
            ) : (
              byBot.map(b => {
                const maxT = Math.max(...byBot.map(x => x.tokens_total ?? 0), 1);
                return (
                  <div key={b.bot_name} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text)' }}>{b.bot_name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {(b.tokens_total ?? 0).toLocaleString('es-AR')} · ${Number(b.cost_usd ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${((b.tokens_total ?? 0) / maxT) * 100}%`,
                          background: 'var(--accent)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SurfaceCard>
      </div>

      {/* Conversations table */}
      <SurfaceCard flush>
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '12px' }}>
            Últimas conversaciones
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <span>Contacto</span>
            <span>Bot</span>
            <span>Tokens</span>
            <span>Costo</span>
            <span>Estado</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)', alignItems: 'center' }}
            >
              <span style={{ color: 'var(--text)' }}>{r.contact_name ?? '—'}</span>
              <span>{r.bot_name ?? '—'}</span>
              <span>{r.tokens_total.toLocaleString('es-AR')}</span>
              <span>${r.cost_usd.toFixed(4)}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  background:
                    r.status === 'ai'
                      ? 'var(--success-bg, #dcfce7)'
                      : r.status === 'human'
                      ? 'var(--warn-bg, #fef9c3)'
                      : 'var(--muted-bg, #f3f4f6)',
                  color:
                    r.status === 'ai'
                      ? 'var(--success, #16a34a)'
                      : r.status === 'human'
                      ? 'var(--warn, #ca8a04)'
                      : 'var(--text-muted)',
                }}
              >
                {r.status === 'ai' ? 'IA' : r.status === 'human' ? 'Humano' : 'Resuelto'}
              </span>
            </div>
          ))}
          {rows.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
              Sin conversaciones
            </p>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
