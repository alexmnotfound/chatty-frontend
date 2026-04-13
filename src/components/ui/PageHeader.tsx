interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="panel-toolbar panel-toolbar--page">
      <div className="panel-toolbar-text">
        <h1 className="panel-toolbar-title">{title}</h1>
        {subtitle && <p className="panel-toolbar-sub">{subtitle}</p>}
      </div>
    </div>
  );
}
