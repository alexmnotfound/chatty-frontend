import type { BotStats } from './types';

interface StatStripProps { stats: BotStats }

export function StatStrip({ stats }: StatStripProps) {
  const delta = stats.conversationsDelta;
  const up = delta >= 0;
  return (
    <div className="br-stats">
      <Stat label={<>Conversaciones <span className="tiny">7d</span></>}>
        <span className="br-stat-value">
          {stats.conversations7d.toLocaleString('es-AR')}
          <span className={`delta${up ? '' : ' down'}`}>
            {up ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        </span>
      </Stat>
      <Stat label="Resolución IA">
        <span className="br-stat-value">{stats.iaResolution}<span className="unit">%</span></span>
      </Stat>
      <Stat label="Derivación a humano">
        <span className="br-stat-value">{stats.humanHandoffRate}<span className="unit">%</span></span>
      </Stat>
      <Stat label="CSAT promedio">
        {stats.csatAverage != null
          ? <span className="br-stat-value">{stats.csatAverage}<span className="unit">/5</span></span>
          : <span className="br-stat-value" style={{ color: 'var(--text-muted)' }}>—</span>
        }
      </Stat>
    </div>
  );
}

function Stat({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="br-stat">
      <span className="br-stat-label">{label}</span>
      {children}
    </div>
  );
}
