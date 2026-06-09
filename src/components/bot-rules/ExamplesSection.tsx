import type { Example } from './types';

interface Props { examples: Example[] }

const STATUS_STYLES: Record<Example['status'], { label: string; cls: string }> = {
  learned: { label: 'aprendido', cls: 'ia'     },
  handoff: { label: 'deriva',    cls: 'human'  },
  pending: { label: 'pendiente', cls: 'neutral'},
};

export function ExamplesSection({ examples }: Props) {
  return (
    <section className="br-section">
      <header className="br-section-head">
        <div className="br-section-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="titles">
          <h2>Ejemplos de conversación</h2>
          <span className="desc">Few-shots · el modelo aprende del tono y formato.</span>
        </div>
        <span className="chip">{examples.length} ejemplos</span>
      </header>
      <div className="br-examples">
        {examples.map(ex => {
          const s = STATUS_STYLES[ex.status];
          return (
            <div key={ex.id} className="br-example">
              <span className="br-example-cat">{ex.category}</span>
              <span className="br-example-user">“{ex.userSays}”</span>
              <span className="br-example-bot">“{ex.botReplies}”</span>
              <span className={`br-badge ${s.cls}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
