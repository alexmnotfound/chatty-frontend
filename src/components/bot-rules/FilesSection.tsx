import { useState } from 'react';
import type { BotFile } from './types';

interface Props {
  botId: string;
  files: BotFile[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPasteText: (text: string, name: string) => Promise<void>;
  uploading?: boolean;
}

const KIND_STYLES: Record<BotFile['kind'], { label: string; cls: string }> = {
  pdf:   { label: 'PDF',  cls: 'pdf' },
  txt:   { label: 'TXT',  cls: 'doc' },
  paste: { label: 'TXT',  cls: 'doc' },
};

const STATUS_LABEL: Record<BotFile['status'], string> = {
  active:     'activo',
  review:     'revisar',
  processing: 'procesando',
  error:      'error',
};

export function FilesSection({ files, onUpload, onDelete, onPasteText, uploading }: Props) {
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteName, setPasteName] = useState('');
  const [savingPaste, setSavingPaste] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

      <div className="br-files">
        {files.map(f => {
          const k = KIND_STYLES[f.kind];
          const sizeLabel = f.sizeBytes >= 1_000_000
            ? `${(f.sizeBytes / 1_000_000).toFixed(1).replace('.', ',')} MB`
            : `${Math.round(f.sizeBytes / 1_000)} KB`;
          const isDeleting = deletingId === f.id;
          return (
            <div key={f.id} className="br-file">
              <div className={`br-file-kind ${k.cls}`}>{k.label}</div>
              <div className="br-file-meta">
                <div className="br-file-name">{f.name}</div>
                <div className="br-file-hint">{sizeLabel} · indexado {f.indexedAt}</div>
              </div>
              <span className={`br-badge ${f.status === 'active' ? 'ia' : 'neutral'}`}>
                {STATUS_LABEL[f.status] ?? f.status}
              </span>
              <button
                className="br-file-delete"
                title="Eliminar"
                disabled={isDeleting}
                onClick={() => handleDelete(f.id)}
                style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', opacity: isDeleting ? 0.4 : 0.6, fontSize: 14 }}
              >
                ✕
              </button>
            </div>
          );
        })}

        {uploading && (
          <div className="br-file">
            <div className="br-file-kind upload">…</div>
            <div className="br-file-meta">
              <div className="br-file-name">Procesando…</div>
              <div className="br-file-hint">Generando embeddings</div>
            </div>
          </div>
        )}

        <label className="br-file br-file-upload" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}>
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
          className="br-file br-file-upload"
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
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
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            <button className="br-btn-secondary" onClick={() => { setShowPaste(false); setPasteText(''); setPasteName(''); }}>
              Cancelar
            </button>
            <button className="br-btn-primary" disabled={!pasteText.trim() || savingPaste} onClick={handlePasteSave}>
              {savingPaste ? 'Guardando…' : 'Guardar texto'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
