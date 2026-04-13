import { type ReactNode } from "react";

interface BadgeProps {
  variant?: "default" | "ai" | "human" | "unread" | "pending" | "in_progress" | "done";
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const cls = ["badge", variant !== "default" && `badge--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return <span className={cls}>{children}</span>;
}
