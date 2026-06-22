import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "../ThemeToggle";
import { useEffect, useState } from "react";
import { settings, type AppSettings } from "../api";
import { Button, FormGroup, PageHeader, SurfaceCard, Skeleton } from "../components/ui";
import { useToast } from "../components/ui/Toast";

export default function Settings() {
  const { member, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("");
  const [waToken, setWaToken] = useState("");
  const [waAppSecret, setWaAppSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  type AiProvider = 'openai' | 'claude';
  const [aiModalProvider, setAiModalProvider] = useState<AiProvider | null>(null);
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [aiKeyError, setAiKeyError] = useState("");
  const [aiKeySaving, setAiKeySaving] = useState(false);

  const validatePhoneNumberId = (val: string) => {
    if (val.trim() && !/^\d+$/.test(val.trim())) return "El Phone Number ID debe contener solo dígitos";
    return "";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleLabel =
    member?.role === "admin" ? "Administrador" : member?.role === "agent" ? "Agente" : "—";

  useEffect(() => {
    settings
      .get()
      .then((cfg) => {
        setAppSettings(cfg);
        setWaPhoneNumberId(cfg.whatsappPhoneNumberId ?? "");
      })
      .catch(() => {
        toast("No se pudo cargar la configuración", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveAiKey = async () => {
    if (!aiModalProvider || !aiKeyInput.trim()) return;
    setAiKeySaving(true);
    setAiKeyError("");
    try {
      await settings.validateAiKey(aiModalProvider, aiKeyInput.trim());
      const updated = await settings.update(
        aiModalProvider === 'openai'
          ? { openAiApiKey: aiKeyInput.trim() }
          : { anthropicApiKey: aiKeyInput.trim() }
      );
      setAppSettings(updated);
      setAiModalProvider(null);
      setAiKeyInput("");
      toast("API key guardada", "success");
    } catch (e) {
      setAiKeyError(e instanceof Error ? e.message : "API key inválida");
    } finally {
      setAiKeySaving(false);
    }
  };

  const saveSettings = async () => {
    const newErrors: Record<string, string> = {};
    const phoneErr = validatePhoneNumberId(waPhoneNumberId);
    if (phoneErr) newErrors.waPhoneNumberId = phoneErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const updated = await settings.update({
        whatsappPhoneNumberId: waPhoneNumberId.trim() || undefined,
        whatsappAccessToken: waToken.trim() || undefined,
        whatsappAppSecret: waAppSecret.trim() || undefined,
      });
      setAppSettings(updated);
      setWaToken("");
      setWaAppSecret("");
      toast("Configuración guardada", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel settings-page" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Configuración" subtitle="Tu perfil, rol en el equipo y cómo se ve la aplicación." />

      <div className="page-body">
        {loading ? (
          <Skeleton variant="card" count={3} />
        ) : (
          <>
            <SurfaceCard
              accent
              eyebrow="Cuenta"
              title="Datos de tu usuario"
              description="Esta información está vinculada a tu sesión en Hermes IA."
            >
              <div className="account-strip">
                <div className="account-stat">
                  <div className="account-stat__label">Nombre</div>
                  <div className="account-stat__value">{member?.name ?? "—"}</div>
                </div>
                <div className="account-stat">
                  <div className="account-stat__label">Email</div>
                  <div className="account-stat__value">{member?.email ?? "—"}</div>
                </div>
                <div className="account-stat">
                  <div className="account-stat__label">Rol</div>
                  <div className="account-stat__value">{roleLabel}</div>
                </div>
              </div>
            </SurfaceCard>

            {member?.role === "admin" && (
              <SurfaceCard
                eyebrow="Integraciones"
                title="WhatsApp"
                description="Configurá las credenciales de tu número de WhatsApp Business."
              >
                <FormGroup label="WhatsApp Phone Number ID" error={errors.waPhoneNumberId}>
                  {(props) => (
                    <input
                      {...props}
                      value={waPhoneNumberId}
                      onChange={(e) => { setWaPhoneNumberId(e.target.value); setErrors((prev) => ({ ...prev, waPhoneNumberId: "" })); }}
                      onBlur={() => { const err = validatePhoneNumberId(waPhoneNumberId); if (err) setErrors((prev) => ({ ...prev, waPhoneNumberId: err })); }}
                      placeholder="Ej: 946522505220658"
                    />
                  )}
                </FormGroup>
                <FormGroup label="WhatsApp Access Token">
                  {(props) => (
                    <input
                      {...props}
                      type="password"
                      value={waToken}
                      onChange={(e) => setWaToken(e.target.value)}
                      placeholder={
                        appSettings?.hasWhatsAppAccessToken
                          ? "Token configurado (escribí para reemplazar)"
                          : "Pegar token"
                      }
                    />
                  )}
                </FormGroup>
                <FormGroup label="WhatsApp App Secret">
                  {(props) => (
                    <input
                      {...props}
                      type="password"
                      value={waAppSecret}
                      onChange={(e) => setWaAppSecret(e.target.value)}
                      placeholder={
                        appSettings?.hasWhatsAppAppSecret
                          ? "App Secret configurado (escribí para reemplazar)"
                          : "Pegar App Secret"
                      }
                    />
                  )}
                </FormGroup>
                <Button onClick={saveSettings} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
              </SurfaceCard>
            )}

            {member?.role === "admin" && (
              <SurfaceCard
                eyebrow="Integraciones"
                title="Proveedores de IA"
                description="Configurá las API keys para los modelos de lenguaje."
              >
                <table className="ai-providers-table">
                  <tbody>
                    {([
                      { id: 'openai' as AiProvider, label: 'OpenAI', has: appSettings?.hasOpenAiApiKey },
                      { id: 'claude' as AiProvider, label: 'Anthropic', has: appSettings?.hasAnthropicApiKey },
                    ] as const).map(({ id, label, has }) => (
                      <tr key={id} className="ai-providers-row">
                        <td className="ai-providers-name">{label}</td>
                        <td className="ai-providers-status">
                          {has
                            ? <span className="badge badge-success">Configurado</span>
                            : <span className="badge badge-muted">No configurado</span>}
                        </td>
                        <td className="ai-providers-action">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setAiModalProvider(id); setAiKeyInput(""); setAiKeyError(""); }}
                          >
                            {has ? "Actualizar" : "Configurar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SurfaceCard>
            )}

            <SurfaceCard
              eyebrow="Apariencia"
              title="Tema de la interfaz"
            >
              <div className="appearance-row">
                <div className="appearance-row__text">
                  <strong>Modo claro u oscuro</strong>
                  <span>Se guarda en este navegador y respeta tu elección al volver.</span>
                </div>
                <ThemeToggle />
              </div>
            </SurfaceCard>

            <div className="signout-block">
              <Button variant="ghost" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </>
        )}
      </div>

      {aiModalProvider && (
        <div className="modal-overlay" onClick={() => setAiModalProvider(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{aiModalProvider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}</h3>
            <FormGroup label="API Key" error={aiKeyError}>
              {(props) => (
                <input
                  {...props}
                  type="password"
                  value={aiKeyInput}
                  onChange={(e) => { setAiKeyInput(e.target.value); setAiKeyError(""); }}
                  placeholder={aiModalProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                  autoFocus
                />
              )}
            </FormGroup>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setAiModalProvider(null)}>Cancelar</Button>
              <Button onClick={saveAiKey} disabled={aiKeySaving || !aiKeyInput.trim()}>
                {aiKeySaving ? "Validando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
