import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bots, BotForm, settings } from "../api";
import SurfaceCard from "../components/ui/SurfaceCard";
import StepTemplate from "../components/wizard/StepTemplate";
import StepIdentity from "../components/wizard/StepIdentity";
import StepIntelligence from "../components/wizard/StepIntelligence";
import StepPlugins from "../components/wizard/StepPlugins";

const STEPS = ["Template", "Identidad", "Inteligencia", "Plugins"];
const DEFAULT_FORM: Partial<BotForm> = {
  gender: "neutral",
  tone: "informal",
  examples: [],
  aiProvider: "openai",
  aiModel: "gpt-4o-mini",
  templateType: undefined,
  systemPrompt: "",
};

export default function BotBuilder() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<BotForm>>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [availableProviders, setAvailableProviders] = useState<('openai' | 'claude')[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    settings.get().then((cfg) => {
      const providers: ('openai' | 'claude')[] = [];
      if (cfg.hasOpenAiApiKey) providers.push('openai');
      if (cfg.hasAnthropicApiKey) providers.push('claude');
      setAvailableProviders(providers);
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await bots.create(form);
      navigate("/bots");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const stepComponents = [
    <StepTemplate key="template" data={form} onChange={setForm} />,
    <StepIdentity key="identity" data={form} onChange={setForm} />,
    <StepIntelligence key="intelligence" data={form} onChange={setForm} availableProviders={availableProviders} />,
    <StepPlugins key="plugins" />,
  ];

  return (
    <div className="wizard-page">
      <div className="wizard-header">
        <h2 className="wizard-header__title">Nuevo bot</h2>
        <p className="wizard-header__desc">
          El bot quedará inactivo hasta ser activado por el administrador.
        </p>
      </div>

      {/* Step indicators */}
      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <div key={i} className="wizard-step">
            <div
              className={[
                "wizard-step__dot",
                i < step && "wizard-step__dot--done",
                i === step && "wizard-step__dot--active",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <div
              className={[
                "wizard-step__label",
                i === step && "wizard-step__label--active",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {s}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <SurfaceCard>
        {stepComponents[step]}
      </SurfaceCard>

      {error && <p className="wizard-error">{error}</p>}

      {/* Navigation */}
      <div className="wizard-nav">
        <button
          className="btn btn-ghost"
          onClick={() => (step > 0 ? setStep(step - 1) : navigate("/bots"))}
          type="button"
        >
          {step === 0 ? "Cancelar" : "Anterior"}
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)} type="button">
            Siguiente
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} type="button">
            {saving ? "Guardando..." : "Guardar bot"}
          </button>
        )}
      </div>
    </div>
  );
}
