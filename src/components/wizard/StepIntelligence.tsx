import { Link } from "react-router-dom";
import { BotForm } from "../../api";
import { FormGroup } from "../ui";

const MODELS: Record<string, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini"],
  claude: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-opus-4-8"],
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
  availableProviders: ('openai' | 'claude')[];
}

export default function StepIntelligence({ data, onChange, availableProviders }: Props) {
  const provider = data.aiProvider ?? "openai";
  const examples = data.examples ?? [];

  function pillClass(selected: boolean) {
    return selected ? "wizard-pill wizard-pill--active" : "wizard-pill";
  }

  return (
    <div>
      {/* Provider selector */}
      <div className="form-group">
        <label>Proveedor</label>
        <div className="wizard-pills">
          {(["openai", "claude"] as const)
            .filter(p => availableProviders.includes(p))
            .map((p) => (
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
        {availableProviders.length === 0 && (
          <p className="form-hint" style={{ color: 'var(--text-muted)' }}>
            Configurá al menos un proveedor de IA en{' '}
            <Link to="/settings">Ajustes</Link> para continuar.
          </p>
        )}
      </div>

      {/* Model selector */}
      <FormGroup label="Modelo">
        {(props) => (
          <select
            {...props}
            className="select"
            value={data.aiModel ?? MODELS[provider][0]}
            onChange={(e) => onChange({ ...data, aiModel: e.target.value })}
          >
            {MODELS[provider].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
      </FormGroup>

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
