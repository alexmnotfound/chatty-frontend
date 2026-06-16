import { useState } from "react";
import { BotForm, bots } from "../../api";
import { FormGroup } from "../ui";

const MODELS: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o"],
  claude: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-fable-5"],
};

const GENDERS = [
  { value: "feminine", label: "Femenino" },
  { value: "masculine", label: "Masculino" },
  { value: "non_binary", label: "No binario" },
  { value: "neutral", label: "Neutral" },
];

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
];

interface Props {
  data: Partial<BotForm>;
  onChange: (d: Partial<BotForm>) => void;
}

export default function StepIntelligence({ data, onChange }: Props) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testMsg, setTestMsg] = useState("");
  const provider = data.aiProvider ?? "openai";
  const examples = data.examples ?? [];

  async function handleTest() {
    if (!data.aiApiKey || !data.aiModel) return;
    setTestStatus("testing");
    try {
      const res = await bots.testAi(provider, data.aiApiKey, data.aiModel);
      setTestStatus("ok");
      setTestMsg(`OK: "${res.response}"`);
    } catch (e: unknown) {
      setTestStatus("error");
      setTestMsg(e instanceof Error ? e.message : "Error al probar");
    }
  }

  function pillClass(selected: boolean) {
    return selected ? "wizard-pill wizard-pill--active" : "wizard-pill";
  }

  return (
    <div>
      {/* Provider selector */}
      <div className="form-group">
        <label>Proveedor</label>
        <div className="wizard-pills">
          {(["openai", "claude"] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={pillClass(provider === p)}
              onClick={() => onChange({ ...data, aiProvider: p, aiModel: MODELS[p][0] })}
            >
              {p === "openai" ? "OpenAI" : "Claude"}
            </button>
          ))}
        </div>
      </div>

      {/* API Key + Model row */}
      <FormGroup label="API Key">
        {(props) => (
          <div className="wizard-row">
            <input
              {...props}
              type="password"
              className="wizard-row__input"
              value={data.aiApiKey ?? ""}
              onChange={(e) => onChange({ ...data, aiApiKey: e.target.value })}
              placeholder={provider === "openai" ? "sk-..." : "sk-ant-..."}
            />
            <select
              className="wizard-row__select select"
              value={data.aiModel ?? MODELS[provider][0]}
              onChange={(e) => onChange({ ...data, aiModel: e.target.value })}
            >
              {MODELS[provider].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleTest}
              disabled={testStatus === "testing" || !data.aiApiKey}
            >
              {testStatus === "testing" ? "Probando..." : "Probar"}
            </button>
          </div>
        )}
      </FormGroup>

      {testMsg && (
        <p
          className={
            testStatus === "ok" ? "wizard-status wizard-status--ok" : "wizard-status wizard-status--error"
          }
        >
          {testMsg}
        </p>
      )}

      {/* Gender */}
      <div className="form-group">
        <label>Género</label>
        <div className="wizard-pills">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              className={pillClass(data.gender === g.value)}
              onClick={() => onChange({ ...data, gender: g.value })}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div className="form-group">
        <label>Tono</label>
        <div className="wizard-pills">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={pillClass(data.tone === t.value)}
              onClick={() => onChange({ ...data, tone: t.value })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* System prompt */}
      <FormGroup label="Instrucciones (system prompt)">
        {(props) => (
          <textarea
            {...props}
            value={data.systemPrompt ?? ""}
            onChange={(e) => onChange({ ...data, systemPrompt: e.target.value })}
            placeholder="Ej: Sos la recepcionista de Clínica Sol. Tu rol es responder consultas sobre turnos..."
            rows={5}
          />
        )}
      </FormGroup>

      {/* Few-shot examples */}
      <div className="form-group">
        <div className="wizard-examples-header">
          <label>Conversaciones de ejemplo</label>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              onChange({
                ...data,
                examples: [...examples, { userMessage: "", botResponse: "", order: examples.length }],
              })
            }
          >
            + Agregar
          </button>
        </div>

        {examples.map((ex, i) => (
          <div key={ex.order + "-" + ex.userMessage.slice(0, 12)} className="wizard-example">
            <div className="wizard-example__cols">
              <textarea
                className="wizard-example__area"
                placeholder="Usuario dice..."
                value={ex.userMessage}
                rows={3}
                onChange={(e) => {
                  const exs = [...examples];
                  exs[i] = { ...ex, userMessage: e.target.value };
                  onChange({ ...data, examples: exs });
                }}
              />
              <textarea
                className="wizard-example__area"
                placeholder="Bot responde..."
                value={ex.botResponse}
                rows={3}
                onChange={(e) => {
                  const exs = [...examples];
                  exs[i] = { ...ex, botResponse: e.target.value };
                  onChange({ ...data, examples: exs });
                }}
              />
            </div>
            <button
              type="button"
              className="wizard-example__remove"
              onClick={() => onChange({ ...data, examples: examples.filter((_, j) => j !== i) })}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
