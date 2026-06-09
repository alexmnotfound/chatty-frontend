import type { ReactNode } from 'react';

interface PageHeaderProps {
  botName: string;
  onHistory?: () => void;
  onJson?: () => void;
  onPublish?: () => void;
}

export function PageHeader({ botName, onHistory, onJson, onPublish }: PageHeaderProps) {
  return (
    <div className="br-page-head">
      <div>
        <h1 className="br-page-title">
          Reglas de bots <span className="dot">·</span><span className="who">{botName}</span>
        </h1>
        <p className="br-page-sub">
          Configurá cómo piensa, responde y aprende tu asistente. Ediciones en vivo con sincronización automática.
        </p>
      </div>
      <div className="br-head-actions">
        <button className="br-pill-btn" onClick={onHistory}>
          <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg></IconWrap>
          Historial
        </button>
        <button className="br-pill-btn" onClick={onJson}>
          <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M14 5l-4 14"/></svg></IconWrap>
          JSON
        </button>
        <button className="br-pill-btn accent" onClick={onPublish}>
          <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 10a5 5 0 0 1 5 5l-4 4h-4l-2-2V10z"/><path d="M8 14l-5 5 3-1 1-3"/><path d="M14 10a9 9 0 0 1 7-8 9 9 0 0 1-8 7z"/></svg></IconWrap>
          Publicar
        </button>
      </div>
    </div>
  );
}

function IconWrap({ children }: { children: ReactNode }) {
  return <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{children}</span>;
}
