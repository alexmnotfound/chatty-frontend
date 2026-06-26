import { useEffect, useRef, useState } from 'react';
import { bots } from '../../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  botName?: string;
  botId: string;
  systemPrompt: string;
  greeting?: string;
  onCollapse?: () => void;
}

function fmt(d: Date) {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function LivePreviewPanel({ botName = 'Bot', botId, systemPrompt, greeting, onCollapse }: Props) {
  const [history, setHistory] = useState<Message[]>(
    greeting ? [{ role: 'assistant', content: greeting }] : []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    canvasRef.current?.scrollTo({ top: canvasRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');

    const next: Message[] = [...history, { role: 'user', content: text }];
    setHistory(next);
    setLoading(true);

    try {
      const { reply } = await bots.testChat(botId, systemPrompt, next);
      setHistory(h => [...h, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar respuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const now = new Date();

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
          <div className="br-preview-sub"><span className="mono">prompt actual</span> · sin guardar</div>
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
              <span className="dot"/>en línea <span className="mode">· simulación</span>
            </span>
          </div>
          {history.length > 0 && (
            <button
              className="icon-btn"
              style={{ marginLeft: 'auto' }}
              onClick={() => { setHistory([]); setError(''); }}
              title="Limpiar conversación"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/><path d="M19 6l-1 14H6L5 6"/><path d="M8 6V4h8v2"/>
              </svg>
            </button>
          )}
        </header>

        <div className="br-chat-canvas" ref={canvasRef}>
          {history.length === 0 && !loading && (
            <p className="br-chat-empty">Escribí un mensaje para probar el bot con el prompt actual.</p>
          )}
          {history.map((m, i) => (
            <div key={i} className={`br-brow ${m.role === 'user' ? 'in' : 'out'}`}>
              <div className={`br-bub ${m.role === 'user' ? 'in' : 'out'}`}>
                {m.content}
                <span className="time">{fmt(now)}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="br-brow out">
              <div className="br-bub out br-bub--typing">
                <span/><span/><span/>
              </div>
            </div>
          )}
          {error && (
            <p className="br-chat-error">
              {error.includes('API key') ? (
                <>Sin API key configurada. Andá a <a href="/settings" style={{ color: 'var(--accent)' }}>Configuración</a> y agregá la key del proveedor del bot.</>
              ) : error}
            </p>
          )}
        </div>

        <div className="br-chat-reply">
          <textarea
            className="inp"
            placeholder="Escribí un mensaje…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button className="send" aria-label="Enviar" onClick={send} disabled={loading || !input.trim()}>
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
