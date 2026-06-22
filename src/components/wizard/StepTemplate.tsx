import { useEffect, useState } from "react";
import { botTemplates, type BotTemplate, type BotForm } from "../../api";

interface Props {
  data: Partial<BotForm>;
  onChange: (d: Partial<BotForm>) => void;
}

export default function StepTemplate({ data, onChange }: Props) {
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    botTemplates
      .list()
      .then((list) => {
        if (Array.isArray(list)) setTemplates(list);
      })
      .catch(() => {});
  }, []);

  const select = (t: BotTemplate) => {
    setShowWarning(false);
    onChange({ ...data, templateType: t.key, systemPrompt: t.systemPrompt });
  };

  const skip = () => {
    setShowWarning(true);
    onChange({ ...data, templateType: null, systemPrompt: "" });
  };

  return (
    <div>
      <p style={{ marginBottom: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
        Elegí un punto de partida para el bot. Podés personalizar todo después.
      </p>

      <div className="wizard-templates">
        {templates.map((t) => (
          <button
            key={t.key}
            type="button"
            className={[
              "wizard-template-card",
              data.templateType === t.key && "wizard-template-card--selected",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => select(t)}
            aria-pressed={data.templateType === t.key}
          >
            <p className="wizard-template-card__name">{t.name}</p>
            <p className="wizard-template-card__desc">{t.description}</p>
          </button>
        ))}
      </div>

      <div className="wizard-template-skip">
        <button type="button" onClick={skip}>
          Continuar sin template
        </button>
      </div>

      {showWarning && (
        <div className="wizard-template-warning" role="alert">
          <span>⚠️</span>
          <span>
            Sin template, el prompt queda vacío. Asegurate de definir instrucciones claras y
            seguras antes de activar el bot.
          </span>
        </div>
      )}
    </div>
  );
}
