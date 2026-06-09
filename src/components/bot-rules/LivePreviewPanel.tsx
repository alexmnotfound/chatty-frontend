interface Bubble {
  side: 'in' | 'out';
  text: string;
  time: string;
}

interface Props {
  botName?: string;
  bubbles?: Bubble[];
  onCollapse?: () => void;
}

const DEFAULT_BUBBLES: Bubble[] = [
  { side: 'in',  text: 'Hey',                                        time: '14:32' },
  { side: 'in',  text: '👋 ¿A qué hora abren mañana?',               time: '14:32' },
  { side: 'out', text: '¡Hola! Abrimos de lunes a viernes de 9:00 a 18:00 h. ¿Puedo ayudarte con algo más?', time: '14:32' },
  { side: 'in',  text: '¿Tienen estacionamiento?',                   time: '14:33' },
  { side: 'out', text: 'Sí, contamos con estacionamiento gratuito para clientes. ¿Querés que te agende una visita?', time: '14:33' },
  { side: 'in',  text: 'Sí, por favor',                              time: '14:34' },
  { side: 'out', text: 'Perfecto. Te paso con un asesor humano para coordinar. Un momento…', time: '14:34' },
];

export function LivePreviewPanel({ botName = 'Recepcionista Bot', bubbles = DEFAULT_BUBBLES, onCollapse }: Props) {
  return (
    <aside className="br-preview">
      <div className="br-preview-head">
        <div>
          <div className="br-preview-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Vista previa en vivo
          </div>
          <div className="br-preview-sub"><span className="mono">sync</span> · autoupdate</div>
        </div>
        <button className="icon-btn" onClick={onCollapse} aria-label="Ocultar panel">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>
          </svg>
        </button>
      </div>

      <div className="br-chat">
        <header className="br-chat-head">
          <div className="br-chat-av">{botName.charAt(0)}</div>
          <div className="br-chat-meta">
            <span className="br-chat-name">{botName}</span>
            <span className="br-chat-pres">
              <span className="dot"/>en línea <span className="mode">· modo IA</span>
            </span>
          </div>
        </header>

        <div className="br-chat-canvas">
          {bubbles.map((b, i) => (
            <div key={i} className={`br-brow ${b.side}`}>
              <div className={`br-bub ${b.side}`}>
                {b.text}
                <span className="time">{b.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="br-chat-reply">
          <div className="inp">Escribí un mensaje…</div>
          <button className="send" aria-label="Enviar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="br-preview-foot">Simulación · no se envía a clientes</div>
    </aside>
  );
}
