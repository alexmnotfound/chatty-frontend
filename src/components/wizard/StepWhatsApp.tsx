import { useState } from "react";
import { BotForm, bots } from "../../api";
import { FormGroup } from "../ui";

interface Props {
  data: Partial<BotForm>;
  onChange: (d: Partial<BotForm>) => void;
}

export default function StepWhatsApp({ data, onChange }: Props) {
  const [status, setStatus] = useState<"idle" | "verifying" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function handleVerify() {
    if (!data.whatsappPhoneNumberId || !data.whatsappAccessToken) return;
    setStatus("verifying");
    try {
      const res = await bots.verify(data.whatsappPhoneNumberId, data.whatsappAccessToken);
      setStatus("ok");
      setMsg(`Conectado: ${res.displayPhoneNumber}`);
    } catch (e: unknown) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Error al verificar");
    }
  }

  return (
    <div>
      <FormGroup label="Phone Number ID (Meta)">
        {(props) => (
          <input
            {...props}
            value={data.whatsappPhoneNumberId ?? ""}
            onChange={(e) => onChange({ ...data, whatsappPhoneNumberId: e.target.value })}
            placeholder="123456789012345"
          />
        )}
      </FormGroup>

      <FormGroup label="Access Token">
        {(props) => (
          <input
            {...props}
            type="password"
            value={data.whatsappAccessToken ?? ""}
            onChange={(e) => onChange({ ...data, whatsappAccessToken: e.target.value })}
            placeholder="EAA..."
          />
        )}
      </FormGroup>

      <FormGroup label="App Secret">
        {(props) => (
          <input
            {...props}
            type="password"
            value={data.whatsappAppSecret ?? ""}
            onChange={(e) => onChange({ ...data, whatsappAppSecret: e.target.value })}
            placeholder="abc123..."
          />
        )}
      </FormGroup>

      <div className="form-actions" style={{ justifyContent: "flex-start" }}>
        <button
          className="btn btn-ghost"
          onClick={handleVerify}
          disabled={status === "verifying" || !data.whatsappPhoneNumberId || !data.whatsappAccessToken}
          type="button"
        >
          {status === "verifying" ? "Verificando..." : "Verificar conexión"}
        </button>
      </div>

      {msg && (
        <p
          className={status === "ok" ? "wizard-status wizard-status--ok" : "wizard-status wizard-status--error"}
        >
          {msg}
        </p>
      )}

      <div className="wizard-webhook-hint">
        <strong>URL del webhook para Meta (disponible al guardar):</strong>
        <br />
        <code>{`${import.meta.env.VITE_API_URL ?? "https://api.tudominio.com"}/webhook/{bot-id}`}</code>
        <br />
        <small>(el ID del bot estará disponible después de guardar)</small>
      </div>
    </div>
  );
}
