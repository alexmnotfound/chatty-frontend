import { toast } from "../lib/toast";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { settings, type AppSettings } from "../api";
import { Button, FormGroup, PageHeader, SurfaceCard, Skeleton } from "../components/ui";

export default function Settings() {
  const { member } = useAuth();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waModalPhoneNumber, setWaModalPhoneNumber] = useState("");
  const [waModalPhoneNumberId, setWaModalPhoneNumberId] = useState("");
  const [waModalToken, setWaModalToken] = useState("");
  const [waModalSecret, setWaModalSecret] = useState("");
  const [waSaving, setWaSaving] = useState(false);

  type AiProvider = 'openai' | 'claude';
  const [aiModalProvider, setAiModalProvider] = useState<AiProvider | null>(null);
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [aiKeyError, setAiKeyError] = useState("");
  const [aiKeySaving, setAiKeySaving] = useState(false);

  // Company info state
  const [companyName, setCompanyName] = useState("");
  const [companyHours, setCompanyHours] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyServices, setCompanyServices] = useState("");
  const [companyContact, setCompanyContact] = useState("");
  const [companySaving, setCompanySaving] = useState(false);

  useEffect(() => {
    settings
      .get()
      .then((cfg) => {
        setAppSettings(cfg);
        setCompanyName(cfg.companyName ?? "");
        setCompanyHours(cfg.companyHours ?? "");
        setCompanyAddress(cfg.companyAddress ?? "");
        setCompanyServices(cfg.companyServices ?? "");
        setCompanyContact(cfg.companyContact ?? "");
      })
      .catch(() => toast("No se pudo cargar la configuración", "error"))
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

  function phoneToFlag(number: string): string {
    const map: [string, string][] = [
      ['+54', '🇦🇷'], ['+1', '🇺🇸'], ['+52', '🇲🇽'],
      ['+55', '🇧🇷'], ['+34', '🇪🇸'], ['+44', '🇬🇧'],
    ];
    for (const [prefix, flag] of map) {
      if (number.startsWith(prefix)) return flag;
    }
    return '📞';
  }

  const saveDefaultRouting = async (value: "ai" | "human") => {
    try {
      const updated = await settings.update({ defaultRouting: value });
      setAppSettings(updated);
      toast("Configuración guardada", "success");
    } catch {
      toast("No se pudo guardar", "error");
    }
  };

  const saveWaConfig = async () => {
    setWaSaving(true);
    try {
      const payload: Parameters<typeof settings.update>[0] = {};
      if (waModalPhoneNumber.trim())   payload.whatsappPhoneNumber   = waModalPhoneNumber.trim();
      if (waModalPhoneNumberId.trim()) payload.whatsappPhoneNumberId = waModalPhoneNumberId.trim();
      if (waModalToken.trim())         payload.whatsappAccessToken   = waModalToken.trim();
      if (waModalSecret.trim())        payload.whatsappAppSecret     = waModalSecret.trim();
      const updated = await settings.update(payload);
      setAppSettings(updated);
      setWaModalOpen(false);
      setWaModalPhoneNumber("");
      setWaModalPhoneNumberId("");
      setWaModalToken("");
      setWaModalSecret("");
      toast("Configuración guardada", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo guardar", "error");
    } finally {
      setWaSaving(false);
    }
  };

  const saveCompanyInfo = async () => {
    setCompanySaving(true);
    try {
      const updated = await settings.update({
        companyName: companyName.trim(),
        companyHours: companyHours.trim(),
        companyAddress: companyAddress.trim(),
        companyServices: companyServices.trim(),
        companyContact: companyContact.trim(),
      });
      setAppSettings(updated);
      toast("Datos de empresa guardados", "success");
    } catch {
      toast("No se pudo guardar", "error");
    } finally {
      setCompanySaving(false);
    }
  };

  return (
    <div className="panel settings-page" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Configuración" subtitle="Integraciones, claves de IA y datos de tu empresa." />

      <div className="page-body">
        {loading ? (
          <Skeleton variant="card" count={3} />
        ) : member?.role === "admin" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "stretch" }}>
              {/* Left: company info — stretches to match right column */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <SurfaceCard
                  eyebrow="Empresa"
                  title="Datos de la empresa"
                  description='Usados en los prompts como {{empresa.nombre}}, {{empresa.horarios}}, etc.'
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <FormGroup label="Nombre">
                      {(props) => (
                        <input
                          {...props}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ej: Cl&#237;nica San Mart&#237;n"
                        />
                      )}
                    </FormGroup>
                    <FormGroup label="Horarios">
                      {(props) => (
                        <input
                          {...props}
                          value={companyHours}
                          onChange={(e) => setCompanyHours(e.target.value)}
                          placeholder="Ej: Lunes a viernes de 9 a 18 h"
                        />
                      )}
                    </FormGroup>
                    <FormGroup label="Direcci&#243;n">
                      {(props) => (
                        <input
                          {...props}
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Ej: Av. Corrientes 1234, CABA"
                        />
                      )}
                    </FormGroup>
                    <FormGroup label="Servicios">
                      {(props) => (
                        <textarea
                          {...props}
                          rows={3}
                          value={companyServices}
                          onChange={(e) => setCompanyServices(e.target.value)}
                          placeholder="Ej: Consultas cl&#237;nicas, odontolog&#237;a, pediatr&#237;a"
                        />
                      )}
                    </FormGroup>
                    <FormGroup label="Contacto">
                      {(props) => (
                        <input
                          {...props}
                          value={companyContact}
                          onChange={(e) => setCompanyContact(e.target.value)}
                          placeholder="Ej: info@clinica.com / +54 11 1234-5678"
                        />
                      )}
                    </FormGroup>
                    <div>
                      <Button onClick={saveCompanyInfo} disabled={companySaving}>
                        {companySaving ? "Guardando..." : "Guardar datos"}
                      </Button>
                    </div>
                  </div>
                </SurfaceCard>
              </div>

              {/* Right: integrations stacked */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <SurfaceCard
                  eyebrow="Integraciones"
                  title="WhatsApp"
                  description="Configurá las credenciales de tu n&#250;mero de WhatsApp Business."
                >
                  <table className="ai-providers-table">
                    <tbody>
                      <tr className="ai-providers-row">
                        <td className="ai-providers-name">
                          {appSettings?.whatsappPhoneNumber
                            ? `${phoneToFlag(appSettings.whatsappPhoneNumber)} ${appSettings.whatsappPhoneNumber}`
                            : appSettings?.whatsappPhoneNumberId
                            ? `ID: ${appSettings.whatsappPhoneNumberId}`
                            : '—'}
                        </td>
                        <td className="ai-providers-status">
                          {appSettings?.whatsappTokenExpired
                            ? <span className="badge badge-error">Token vencido</span>
                            : appSettings?.hasWhatsAppAccessToken && appSettings?.hasWhatsAppAppSecret
                            ? <span className="badge badge-success">Configurado</span>
                            : (appSettings?.hasWhatsAppAccessToken || appSettings?.hasWhatsAppAppSecret)
                            ? <span className="badge badge-warning">Incompleto</span>
                            : <span className="badge badge-muted">No configurado</span>}
                        </td>
                        <td className="ai-providers-action">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setWaModalPhoneNumber(appSettings?.whatsappPhoneNumber ?? "");
                              setWaModalPhoneNumberId(appSettings?.whatsappPhoneNumberId ?? "");
                              setWaModalToken("");
                              setWaModalSecret("");
                              setWaModalOpen(true);
                            }}
                          >
                            {(appSettings?.whatsappPhoneNumber || appSettings?.whatsappPhoneNumberId || appSettings?.hasWhatsAppAccessToken)
                              ? "Actualizar"
                              : "Configurar"}
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </SurfaceCard>

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

                <SurfaceCard
                  eyebrow="Comportamiento"
                  title="Atenci&#243;n por defecto"
                  description="C&#243;mo se atienden los nuevos contactos la primera vez que escriben."
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      variant={appSettings?.defaultRouting === "ai" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => saveDefaultRouting("ai")}
                    >
                      Bot
                    </Button>
                    <Button
                      variant={appSettings?.defaultRouting === "human" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => saveDefaultRouting("human")}
                    >
                      Humano
                    </Button>
                  </div>
                </SurfaceCard>
              </div>
            </div>
        ) : null}
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

      {waModalOpen && (
        <div className="modal-overlay" onClick={() => setWaModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>WhatsApp Business</h3>
            <FormGroup label="N&#250;mero de tel&#233;fono">
              {(props) => (
                <input
                  {...props}
                  type="tel"
                  value={waModalPhoneNumber}
                  onChange={(e) => setWaModalPhoneNumber(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  autoFocus
                />
              )}
            </FormGroup>
            <FormGroup label="Phone Number ID">
              {(props) => (
                <input
                  {...props}
                  value={waModalPhoneNumberId}
                  onChange={(e) => setWaModalPhoneNumberId(e.target.value)}
                  placeholder="Ej: 946522505220658"
                />
              )}
            </FormGroup>
            <FormGroup label="Access Token">
              {(props) => (
                <input
                  {...props}
                  type="password"
                  value={waModalToken}
                  onChange={(e) => setWaModalToken(e.target.value)}
                  placeholder={appSettings?.hasWhatsAppAccessToken ? "Configurado (escrib&#237; para reemplazar)" : "Pegar token"}
                />
              )}
            </FormGroup>
            <FormGroup label="App Secret">
              {(props) => (
                <input
                  {...props}
                  type="password"
                  value={waModalSecret}
                  onChange={(e) => setWaModalSecret(e.target.value)}
                  placeholder={appSettings?.hasWhatsAppAppSecret ? "Configurado (escrib&#237; para reemplazar)" : "Pegar App Secret"}
                />
              )}
            </FormGroup>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setWaModalOpen(false)}>Cancelar</Button>
              <Button onClick={saveWaConfig} disabled={waSaving}>
                {waSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
