import { type ReactNode, useId } from "react";

interface FormGroupProps {
  label: string;
  error?: string;
  children: (props: {
    id: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}

export default function FormGroup({ label, error, children }: FormGroupProps) {
  const autoId = useId();
  const errorId = `${autoId}-error`;

  return (
    <div className="form-group">
      <label htmlFor={autoId}>{label}</label>
      {children({
        id: autoId,
        ...(error ? { "aria-invalid": true, "aria-describedby": errorId } : {}),
      })}
      {error && (
        <p className="form-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
