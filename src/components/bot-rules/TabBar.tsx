import type { TabId } from './types';

interface TabBarProps {
  active: TabId;
  counts: Record<TabId, number>;
  onChange: (id: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'parameters',   label: 'Parámetros' },
  { id: 'instructions', label: 'Instrucciones' },
  { id: 'examples',     label: 'Ejemplos' },
  { id: 'files',        label: 'Archivos' },
];

export function TabBar({ active, counts, onChange }: TabBarProps) {
  return (
    <div className="br-tabs" role="tablist">
      {TABS.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`br-tab${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          <span className="br-tab-count">{counts[t.id]}</span>
        </button>
      ))}
    </div>
  );
}
