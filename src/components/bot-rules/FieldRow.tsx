import type { ReactNode } from 'react';

interface FieldRowProps {
  name: string;
  hint?: string;
  children: ReactNode;
}

export function FieldRow({ name, hint, children }: FieldRowProps) {
  return (
    <div className="br-field">
      <div className="br-field-label">
        <span className="n">{name}</span>
        {hint && <span className="h">{hint}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}
