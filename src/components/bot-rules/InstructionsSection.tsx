import type { BotRules } from './types';

interface Props {
  rules: BotRules;
  onChange: (patch: Partial<BotRules>) => void;
}

export function InstructionsSection({ rules, onChange }: Props) {
  const chars = rules.instructions.length;
  const tokens = Math.round(chars / 4);           // rough heuristic

  return (
    <section className="br-section">
      <header className="br-section-head">
        <div className="br-section-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div className="titles">
          <h2>Instrucciones</h2>
          <span className="desc">System prompt · guardrails · estilo de respuesta.</span>
        </div>
        <div className="chip-group">
          <span className="chip">{chars} / 2000 chars</span>
          <span className="chip">~{tokens} tokens</span>
          <span className="chip">{rules.variables.length} variables</span>
        </div>
      </header>

      <div className="br-var-list">
        {rules.variables.map(v => <span key={v} className="br-var">{`{{${v}}}`}</span>)}
      </div>

      <div style={{ padding: '6px 18px 18px' }}>
        <textarea
          className="br-textarea"
          value={rules.instructions}
          onChange={e => onChange({ instructions: e.target.value })}
          maxLength={2000}
        />
      </div>
    </section>
  );
}
