import { MODEL_OPTIONS } from './mockData';
import type { ModelId } from './types';

interface ModelPickerProps {
  value: ModelId;
  onChange: (id: ModelId) => void;
}

export function ModelPicker({ value, onChange }: ModelPickerProps) {
  return (
    <div className="br-models">
      {MODEL_OPTIONS.map(m => {
        const selected = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            className={`br-model${selected ? ' selected' : ''}`}
            onClick={() => onChange(m.id)}
            aria-pressed={selected}
          >
            <span className={`br-model-logo ${m.provider === 'anthropic' ? 'anth' : m.provider}`}>
              {m.provider === 'anthropic' ? '★' : m.provider === 'openai' ? '◎' : '◆'}
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
