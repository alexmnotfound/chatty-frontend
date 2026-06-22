import { toast } from "../lib/toast";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSuperAuth } from "../SuperAuthContext";
import ThemeToggle from "../ThemeToggle";
import { Button, FormGroup } from "../components/ui";

export default function SuperLogin() {
  const { login } = useSuperAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/super");
    } catch {
      const msg = "Email o contraseña incorrectos.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-theme-bar">
        <span />
        <ThemeToggle />
      </div>
      <div className="login-brand">
        <h1>Hermes IA</h1>
        <p>Panel de administración de plataforma</p>
      </div>
      <form onSubmit={handleSubmit} className="card login-card">
        <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Acceso de administrador</h2>
        <FormGroup label="Email">
          {(props) => (
            <input
              {...props}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          )}
        </FormGroup>
        <FormGroup label="Contraseña">
          {(props) => (
            <input
              {...props}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          )}
        </FormGroup>
        {error && (
          <p aria-live="polite" className="login-error" style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "0.5rem 0.65rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "0.65rem" }}>
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} style={{ width: "100%" }}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
