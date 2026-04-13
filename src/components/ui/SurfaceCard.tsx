import { type ReactNode } from "react";

interface SurfaceCardProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  accent?: boolean;
  flush?: boolean;
  children: ReactNode;
  className?: string;
}

export default function SurfaceCard({
  eyebrow,
  title,
  description,
  accent = false,
  flush = false,
  children,
  className = "",
}: SurfaceCardProps) {
  const cls = [
    "surface-card",
    accent && "surface-card--accent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cls}>
      {(eyebrow || title || description) && (
        <header className="surface-card__head">
          {eyebrow && <span className="surface-card__eyebrow">{eyebrow}</span>}
          {title && <h2 className="surface-card__title">{title}</h2>}
          {description && <p className="surface-card__desc">{description}</p>}
        </header>
      )}
      <div className={`surface-card__body${flush ? " surface-card__body--tight" : ""}`}>
        {children}
      </div>
    </article>
  );
}
