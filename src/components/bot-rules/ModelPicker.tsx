import { MODEL_OPTIONS } from './mockData';
import type { ModelId } from './types';

interface ModelPickerProps {
  value: ModelId;
  onChange: (id: ModelId) => void;
  availableProviders?: ('openai' | 'claude')[];
}

export function ModelPicker({ value, onChange, availableProviders }: ModelPickerProps) {
  const visible = availableProviders
    ? MODEL_OPTIONS.filter(m => availableProviders.includes(m.provider))
    : MODEL_OPTIONS;

  if (visible.length === 0) {
    return (
      <p className="br-models-empty">
        Ningún proveedor de IA configurado.{' '}
        <a href="/settings">Configurar en Ajustes</a>
      </p>
    );
  }

  return (
    <div className="br-models">
      {visible.map(m => {
        const selected = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            className={`br-model${selected ? ' selected' : ''}`}
            onClick={() => onChange(m.id)}
            aria-pressed={selected}
          >
            <span className={`br-model-logo ${m.provider === 'claude' ? 'anth' : m.provider}`}>
              {m.provider === 'claude' ? '★' : '◎'}
            </span>
            <span className="br-model-body">
              <span className="br-model-name">{m.name}</span>
              <span className="br-model-meta"><b>{m.cost}</b> · {m.note}</span>
            </span>
            <span className="br-model-radio" />
          </button>
        );
      })}
    </div>
  );
}
