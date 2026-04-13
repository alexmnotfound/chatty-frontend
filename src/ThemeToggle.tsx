import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getStoredTheme, toggleTheme, type Theme } from "./theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Theme>(() =>
    typeof document !== "undefined" ? (document.documentElement.dataset.theme as Theme) || getStoredTheme() : "light"
  );

  useEffect(() => {
    const t = (document.documentElement.dataset.theme as Theme) || getStoredTheme();
    setMode(t);
  }, []);

  const onClick = () => {
    const next = toggleTheme();
    setMode(next);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={onClick}
      title={mode === "dark" ? "Modo claro" : "Modo oscuro"}
      aria-label={mode === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {mode === "dark" ? (
        <span className="theme-toggle-icon" aria-hidden>
          <Sun size={16} />
        </span>
      ) : (
        <span className="theme-toggle-icon" aria-hidden>
          <Moon size={16} />
        </span>
      )}
    </button>
  );
}
