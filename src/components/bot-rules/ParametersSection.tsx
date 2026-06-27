import type { BotRules, ModelOption, Tone, Gender } from './types';
import { FieldRow } from './FieldRow';
import { ModelPicker } from './ModelPicker';
import { Toggle } from './Toggle';

interface Props {
  rules: BotRules;
  onChange: (patch: Partial<BotRules>) => void;
  availableProviders?: ModelOption['provider'][];
}

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'formal',   label: 'Formal' },
  { value: 'informal', label: 'Informal' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'feminine',   label: 'Femenino' },
  { value: 'masculine',  label: 'Masculino' },
  { value: 'non_binary', label: 'No binario' },
  { value: 'neutral',    label: 'Neutral' },
];

function Pills<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="wizard-pill-group">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          className={o.value === value ? 'wizard-pill wizard-pill--active' : 'wizard-pill'}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ParametersSection({ rules, onChange, availableProviders }: Props) {
  const bh = rules.businessHours;
  const hh = rules.humanHandoff;

  return (
    <section className="br-section">
      <header className="br-section-head">
        <div className="br-section-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h8"/><path d="M16 6h4"/><circle cx="14" cy="6" r="2"/>
            <path d="M4 12h4"/><path d="M12 12h8"/><circle cx="10" cy="12" r="2"/>
            <path d="M4 18h10"/><path d="M18 18h2"/><circle cx="16" cy="18" r="2"/>
          </svg>
        </div>
        <div className="titles">
          <h2>Parámetros</h2>
          <span className="desc">Identidad del bot · modelo · límites · contingencia.</span>
        </div>
      </header>

      <div className="br-section-body">
        <FieldRow name="Nombre visible" hint="Aparece en el header del chat">
          <input className="br-input" value={rules.name} onChange={e => onChange({ name: e.target.value })} />
        </FieldRow>

        <FieldRow name="Modelo" hint="Costo · velocidad · contexto">
          <ModelPicker value={rules.model} onChange={id => onChange({ model: id })} availableProviders={availableProviders} />
        </FieldRow>

        <FieldRow name="Tono" hint="Cómo habla el bot">
          <Pills value={rules.tone} options={TONE_OPTIONS} onChange={v => onChange({ tone: v })} />
        </FieldRow>

        <FieldRow name="Género" hint="Afecta conjugaciones y artículos">
          <Pills value={rules.gender} options={GENDER_OPTIONS} onChange={v => onChange({ gender: v })} />
        </FieldRow>

        <FieldRow name="Saludo inicial" hint="Primer mensaje que envía el bot">
          <input className="br-input" value={rules.greeting} onChange={e => onChange({ greeting: e.target.value })} />
        </FieldRow>

        <FieldRow name="Longitud máxima" hint="Corta · media · larga">
          <select
            className="br-input"
            value={rules.maxLength}
            onChange={e => onChange({ maxLength: e.target.value as BotRules['maxLength'] })}
          >
            <option value="short">Corta · ~60 palabras</option>
            <option value="medium">Media · ~120 palabras</option>
            <option value="long">Larga · ~240 palabras</option>
          </select>
        </FieldRow>

        <FieldRow name="Respetar horario de empresa" hint="Fuera del horario cargado en Configuración, el bot informa al cliente y no procesa consultas.">
          <div className="br-toggle-row">
            <Toggle
              checked={bh.enabled}
              onChange={v => onChange({ businessHours: { enabled: v } })}
              label="Respetar horario de empresa"
            />
          </div>
        </FieldRow>

        <FieldRow name="Derivación a humano" hint="El bot transfiere cuando no puede resolver">
          <input
            className="br-input"
            placeholder="Equipo destino (ej. ventas)"
            value={hh.team}
            onChange={e => onChange({ humanHandoff: { ...hh, team: e.target.value } })}
          />
        </FieldRow>
      </div>
    </section>
  );
}
