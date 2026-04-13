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
  const [openAiToken, setOpenAiToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        openAiApiKey: openAiToken.trim() || undefined,
      });
      setAppSettings(updated);
      setWaToken("");
      setOpenAiToken("");
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
              description="Esta información está vinculada a tu sesión en Chatty."
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
                title="WhatsApp y OpenAI"
                description="Configurá credenciales sin tocar archivos `.env`."
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
                <FormGroup label="OpenAI API Key">
                  {(props) => (
                    <input
                      {...props}
                      type="password"
                      value={openAiToken}
                      onChange={(e) => setOpenAiToken(e.target.value)}
                      placeholder={
                        appSettings?.hasOpenAiApiKey
                          ? "API key configurada (escribí para reemplazar)"
                          : "Pegar API key"
                      }
                    />
                  )}
                </FormGroup>
                <div className="form-actions">
                  <Button loading={saving} onClick={saveSettings}>
                    {saving ? "Guardando…" : "Guardar integraciones"}
                  </Button>
                </div>
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
    </div>
  );
}
