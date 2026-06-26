interface PageHeaderProps {
  botName: string;
}

export function PageHeader({ botName }: PageHeaderProps) {
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
    </div>
  );
}
