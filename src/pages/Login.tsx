import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../api";
import { useAuth } from "../AuthContext";
import ThemeToggle from "../ThemeToggle";
import { Button, FormGroup } from "../components/ui";
import { useToast } from "../components/ui/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (val: string) => {
    if (!val) return "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "El email no es válido";
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) return "La contraseña es obligatoria";
    if (register && val.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return "";
  };

  const validateName = (val: string) => {
    if (register && !val.trim()) return "El nombre es obligatorio";
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
    if (register) {
      const nameErr = validateName(name);
      if (nameErr) newErrors.name = nameErr;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (register) {
        const res = await auth.register(email, password, name);
        login(res.token, res.member);
      } else {
        const res = await auth.login(email, password);
        login(res.token, res.member);
      }
      navigate("/inbox", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-theme-bar">
        <Link to="/" className="login-back">
          Inicio
        </Link>
        <ThemeToggle />
      </div>
      <div className="login-brand">
        <h1>Chatty</h1>
        <p>Inbox y tareas con WhatsApp</p>
      </div>
      <form onSubmit={submit} className="card login-card">
        {register && (
          <FormGroup label="Nombre" error={errors.name}>
            {(props) => (
              <input
                {...props}
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }}
                onBlur={() => { const err = validateName(name); if (err) setErrors((prev) => ({ ...prev, name: err })); }}
                required
                autoComplete="name"
              />
            )}
          </FormGroup>
        )}
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
              autoComplete={register ? "new-password" : "current-password"}
              minLength={register ? 6 : 1}
            />
          )}
        </FormGroup>
        {error && (
          <p className="login-error" style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: "0.5rem 0.65rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "0.65rem" }}>
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} style={{ width: "100%", marginBottom: "0.5rem" }}>
          {register ? "Registrarse" : "Entrar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          style={{ width: "100%", fontSize: "0.9rem" }}
          onClick={() => { setRegister(!register); setError(""); setErrors({}); }}
        >
          {register ? "Ya tengo cuenta" : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
