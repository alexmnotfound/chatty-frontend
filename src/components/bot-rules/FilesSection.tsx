import { useState } from 'react';
import type { BotFile } from './types';

interface Props {
  botId: string;
  files: BotFile[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPasteText: (text: string, name: string) => Promise<void>;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => Promise<void>;
  onGetContent: (id: string) => Promise<string>;
  onUpdatePaste: (id: string, text: string, name: string) => Promise<void>;
  uploading?: boolean;
}

const KIND_STYLES: Record<BotFile['kind'], { label: string; cls: string }> = {
  pdf:   { label: 'PDF',  cls: 'pdf' },
  txt:   { label: 'TXT',  cls: 'doc' },
  paste: { label: 'TXT',  cls: 'doc' },
};

const STATUS_LABEL: Record<string, string> = {
  active:     'activo',
  inactive:   'inactivo',
  review:     'revisar',
  processing: 'procesando',
  error:      'error',
};

export function FilesSection({ files, onUpload, onDelete, onPasteText, onToggleStatus, onGetContent, onUpdatePaste, uploading }: Props) {
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteName, setPasteName] = useState('');
  const [savingPaste, setSavingPaste] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<BotFile | null>(null);
  const [editText, setEditText] = useState('');
  const [editName, setEditName] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const totalMB = (files.reduce((s, f) => s + f.sizeBytes, 0) / 1_000_000).toFixed(1);

  async function handlePasteSave() {
    if (!pasteText.trim()) return;
    setSavingPaste(true);
    try {
      await onPasteText(pasteText, pasteName || 'Texto pegado');
      setPasteText('');
      setPasteName('');
      setShowPaste(false);
    } finally {
      setSavingPaste(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggle(f: BotFile) {
    const newStatus = f.status === 'active' ? 'inactive' : 'active';
    setTogglingId(f.id);
    try {
      await onToggleStatus(f.id, newStatus);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleEditOpen(f: BotFile) {
    setLoadingEdit(true);
    setEditingFile(f);
    setEditName(f.name);
    setEditText('');
    try {
      const content = await onGetContent(f.id);
      setEditText(content);
    } finally {
      setLoadingEdit(false);
    }
  }

  function handleEditClose() {
    setEditingFile(null);
    setEditText('');
    setEditName('');
  }

  async function handleEditSave() {
    if (!editingFile || !editText.trim()) return;
    setSavingEdit(true);
    try {
      await onUpdatePaste(editingFile.id, editText, editName || editingFile.name);
      handleEditClose();
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <section className="br-section" style={{ marginBottom: 6 }}>
      <header className="br-section-head">
        <div className="br-section-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
          </svg>
        </div>
        <div className="titles">
          <h2>Archivos de contexto</h2>
          <span className="desc">Documentos y textos que el bot usa como base de conocimiento.</span>
        </div>
        <span className="chip">{files.length} archivos · {totalMB.replace('.', ',')} MB</span>
      </header>

      {(files.length > 0 || uploading) && (
        <div className="br-file-list">
          {files.map(f => {
            const k = KIND_STYLES[f.kind];
            const sizeLabel = f.sizeBytes >= 1_000_000
              ? `${(f.sizeBytes / 1_000_000).toFixed(1).replace('.', ',')} MB`
              : `${Math.round(f.sizeBytes / 1_000)} KB`;
            const isDeleting = deletingId === f.id;
            const isToggling = togglingId === f.id;
            const canToggle = f.status === 'active' || f.status === 'inactive';
            const isInactive = f.status === 'inactive';

            return (
              <div key={f.id} className="br-file-row" style={{ opacity: isInactive ? 0.55 : 1 }}>
                <div className={`br-file-kind ${k.cls}`}>{k.label}</div>
                <div className="br-file-meta">
                  <div className="br-file-name">{f.name}</div>
                  <div className="br-file-hint">{sizeLabel} · indexado {f.indexedAt}</div>
                </div>

                {/* Edit button — only for paste docs, before badge so badges align */}
                {f.kind === 'paste' && canToggle && (
                  <button
                    className="br-file-delete"
                    title="Editar texto"
                    onClick={() => handleEditOpen(f)}
                    style={{ fontSize: 13 }}
                  >
                    ✎
                  </button>
                )}

                {/* Toggle status badge */}
                {canToggle ? (
                  <button
                    className={`br-badge ${isInactive ? 'warning' : 'ia'} br-file-toggle`}
                    title={isInactive ? 'Activar' : 'Desactivar'}
                    disabled={isToggling}
                    onClick={() => handleToggle(f)}
                  >
                    {isToggling ? '…' : STATUS_LABEL[f.status]}
                  </button>
                ) : (
                  <span className={`br-badge ${f.status === 'error' ? 'danger' : 'neutral'}`}>
                    {STATUS_LABEL[f.status] ?? f.status}
                  </span>
                )}

                <button
                  className="br-file-delete"
                  title="Eliminar"
                  disabled={isDeleting}
                  onClick={() => handleDelete(f.id)}
                >
                  ✕
                </button>
              </div>
            );
          })}

          {uploading && (
            <div className="br-file-row">
              <div className="br-file-kind upload">…</div>
              <div className="br-file-meta">
                <div className="br-file-name">Procesando…</div>
                <div className="br-file-hint">Generando embeddings</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit paste panel */}
      {editingFile && (
        <div style={{ margin: '0 18px 10px', display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 10 }}>
          <div style={{ font: '600 12px var(--font-sans)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Editar: {editingFile.name}
          </div>
          <input
            className="br-input"
            placeholder="Nombre del documento"
            value={editName}
            onChange={e => setEditName(e.target.value)}
          />
          {loadingEdit ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Cargando texto…</div>
          ) : (
            <textarea
              className="br-textarea"
              rows={8}
              placeholder="Texto del documento…"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="br-btn-sm secondary" onClick={handleEditClose}>
              Cancelar
            </button>
            <button className="br-btn-sm" disabled={!editText.trim() || savingEdit || loadingEdit} onClick={handleEditSave}>
              {savingEdit ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {/* Add actions */}
      <div className="br-file-actions">
        <label className="br-file-action-btn" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}>
          <div className="br-file-kind upload">↑</div>
          <div className="br-file-meta">
            <div className="br-file-name">Subir archivo</div>
            <div className="br-file-hint">PDF o TXT · hasta 10 MB</div>
          </div>
          <input
            type="file"
            accept=".pdf,.txt"
            disabled={uploading}
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }}
          />
        </label>

        <button
          className="br-file-action-btn"
          onClick={() => setShowPaste(p => !p)}
        >
          <div className="br-file-kind doc">✎</div>
          <div className="br-file-meta">
            <div className="br-file-name">Pegar texto</div>
            <div className="br-file-hint">FAQ, catálogo, reglas de negocio</div>
          </div>
        </button>
      </div>

      {showPaste && (
        <div style={{ margin: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <input
            className="br-input"
            placeholder="Nombre del documento (opcional)"
            value={pasteName}
            onChange={e => setPasteName(e.target.value)}
          />
          <textarea
            className="br-textarea"
            rows={8}
            placeholder="Pegá aquí el texto que el bot debe conocer…"
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="br-btn-sm secondary" onClick={() => { setShowPaste(false); setPasteText(''); setPasteName(''); }}>
              Cancelar
            </button>
            <button className="br-btn-sm" disabled={!pasteText.trim() || savingPaste} onClick={handlePasteSave}>
              {savingPaste ? 'Guardando…' : 'Guardar texto'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
