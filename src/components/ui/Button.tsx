import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger-ghost";
  size?: "default" | "sm";
  loading?: boolean;
  icon?: LucideIcon;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "default",
  loading = false,
  icon: Icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const cls = [
    "btn",
    variant === "primary" && "btn-primary",
    variant === "ghost" && "btn-ghost",
    variant === "danger-ghost" && "btn-danger-ghost",
    size === "sm" && "btn-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 size={16} className="btn-spinner" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}
