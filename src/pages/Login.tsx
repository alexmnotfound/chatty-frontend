import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "../ThemeToggle";
import { Button, FormGroup } from "../components/ui";
import { useToast } from "../components/ui/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, member } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (member) navigate("/inbox", { replace: true });
  }, [member]);

  const validateEmail = (val: string) => {
    if (!val) return "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "El email no es válido";
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) return "La contraseña es obligatoria";
    return "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const newErrors: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const passwordErr = validatePassword(password);
    if (passwordErr) newErrors.password = passwordErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : "";
      const msg =
        code === "no_member"
          ? "Tu usuario no tiene una empresa asociada. Contactá a un administrador."
          : "Email o contraseña incorrectos.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-theme-bar">
        <Link to="/" className="login-topbar-logo">Hermes IA</Link>
        <ThemeToggle />
      </div>
      <div className="login-brand">
        <h1>Hermes IA</h1>
        <p>Inbox y tareas con WhatsApp</p>
      </div>
      <form onSubmit={submit} className="card login-card">
        <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Bienvenido de nuevo</h2>
        <FormGroup label="Email" error={errors.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
              onBlur={() => { const err = validateEmail(email); if (err) setErrors((prev) => ({ ...prev, email: err })); }}
              required
              autoComplete="email"
              autoFocus
            />
          )}
        </FormGroup>
        <FormGroup label="Contraseña" error={errors.password}>
          {(props) => (
            <input
              {...props}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
              onBlur={() => { const err = validatePassword(password); if (err) setErrors((prev) => ({ ...prev, password: err })); }}
              required
              autoComplete="current-password"
            />
          )}
        </FormGroup>
        {error && (
          <p className="login-error" aria-live="polite" style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "0.5rem 0.65rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "0.65rem" }}>
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} style={{ width: "100%", marginBottom: "0.5rem" }}>
          Entrar
        </Button>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          ¿No tenés cuenta?{" "}
          <Link to="/register" style={{ color: "var(--accent)" }}>
            Registrate
          </Link>
        </p>
      </form>
    </div>
  );
}
