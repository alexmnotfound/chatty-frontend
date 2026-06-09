import type { BotRules } from './types';
import { FieldRow } from './FieldRow';
import { ModelPicker } from './ModelPicker';
import { ToneSlider } from './ToneSlider';

interface Props {
  rules: BotRules;
  onChange: (patch: Partial<BotRules>) => void;
}

export function ParametersSection({ rules, onChange }: Props) {
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
        <span className="chip">7 campos</span>
      </header>

      <div className="br-section-body">
        <FieldRow name="Nombre visible" hint="Aparece en el header del chat">
          <input className="br-input" value={rules.name} onChange={e => onChange({ name: e.target.value })} />
        </FieldRow>

        <FieldRow name="Modelo" hint="Costo · velocidad · contexto">
          <ModelPicker value={rules.model} onChange={id => onChange({ model: id })} />
        </FieldRow>

        <FieldRow name="Tono" hint="formal ↔ casual">
          <ToneSlider value={rules.tone} onChange={v => onChange({ tone: v })} />
        </FieldRow>

        <FieldRow name="Saludo inicial" hint="primer mensaje">
          <input className="br-input" value={rules.greeting} onChange={e => onChange({ greeting: e.target.value })} />
        </FieldRow>

        <FieldRow name="Longitud máxima" hint="corta · media · larga">
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

      </div>
    </section>
  );
}
