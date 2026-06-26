import { useState } from 'react';
import type { Example } from './types';

interface Props {
  examples: Example[];
  onChange: (examples: Example[]) => void;
}

interface Draft {
  id: string | null;
  userSays: string;
  botReplies: string;
}

export function ExamplesSection({ examples, onChange }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null);

  const startAdd = () => setDraft({ id: null, userSays: '', botReplies: '' });
  const startEdit = (ex: Example) => setDraft({ id: ex.id, userSays: ex.userSays, botReplies: ex.botReplies });
  const cancel = () => setDraft(null);

  const commit = () => {
    if (!draft || !draft.userSays.trim() || !draft.botReplies.trim()) return;
    if (draft.id === null) {
      onChange([...examples, {
        id: String(Date.now()),
        category: '',
        userSays: draft.userSays.trim(),
        botReplies: draft.botReplies.trim(),
        status: 'learned',
      }]);
    } else {
      onChange(examples.map(ex =>
        ex.id === draft.id
          ? { ...ex, userSays: draft.userSays.trim(), botReplies: draft.botReplies.trim() }
          : ex
      ));
    }
    setDraft(null);
  };

  const remove = (id: string) => onChange(examples.filter(ex => ex.id !== id));

  return (
    <section className="br-section">
      <header className="br-section-head">
        <div className="br-section-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div className="titles">
          <h2>Ejemplos de conversaci&#243;n</h2>
          <span className="desc">Few-shots &middot; el modelo aprende del tono y formato.</span>
        </div>
        <span className="chip">{examples.length} ejemplos</span>
        {draft === null && (
          <button className="br-btn-sm" onClick={startAdd}>+ Agregar</button>
        )}
      </header>

      <div className="br-examples">
        {examples.map(ex =>
          draft?.id === ex.id ? (
            <ExampleForm
              key={ex.id}
              draft={draft}
              onChange={setDraft}
              onCommit={commit}
              onCancel={cancel}
              isNew={false}
            />
          ) : (
            <div key={ex.id} className="br-example">
              <div className="br-example-body">
                <span className="br-example-user">
                  <span className="br-example-role">Usuario</span>
                  {ex.userSays}
                </span>
                <span className="br-example-bot">
                  <span className="br-example-role">Bot</span>
                  {ex.botReplies}
                </span>
              </div>
              <div className="br-example-actions">
                <button className="br-example-btn" onClick={() => startEdit(ex)}>Editar</button>
                <button className="br-example-btn danger" onClick={() => remove(ex.id)}>&#x2715;</button>
              </div>
            </div>
          )
        )}

        {draft !== null && draft.id === null && (
          <ExampleForm
            draft={draft}
            onChange={setDraft}
            onCommit={commit}
            onCancel={cancel}
            isNew={true}
          />
        )}

        {examples.length === 0 && draft === null && (
          <p className="br-empty">Sin ejemplos. Agrega pares usuario &rarr; bot para ensenarle el tono al modelo.</p>
        )}
      </div>
    </section>
  );
}

function ExampleForm({ draft, onChange, onCommit, onCancel, isNew }: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onCommit: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const valid = draft.userSays.trim().length > 0 && draft.botReplies.trim().length > 0;
  return (
    <div className="br-example br-example--form">
      <div className="br-example-form-fields">
        <div className="br-example-field">
          <label className="br-example-role">Usuario</label>
          <textarea
            rows={2}
            value={draft.userSays}
            placeholder="Ej: Cuanto cuesta el plan pro?"
            onChange={e => onChange({ ...draft, userSays: e.target.value })}
            autoFocus
          />
        </div>
        <div className="br-example-field">
          <label className="br-example-role">Bot</label>
          <textarea
            rows={2}
            value={draft.botReplies}
            placeholder="Ej: El plan pro cuesta $29/mes e incluye..."
            onChange={e => onChange({ ...draft, botReplies: e.target.value })}
          />
        </div>
      </div>
      <div className="br-example-form-actions">
        <button className="br-btn-sm" onClick={onCommit} disabled={!valid}>
          {isNew ? 'Agregar' : 'Guardar cambios'}
        </button>
        <button className="br-btn-sm secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
