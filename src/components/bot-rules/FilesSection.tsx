import type { BotFile } from './types';

interface Props {
  files: BotFile[];
  onUpload?: (file: File) => void;
}

const KIND_STYLES: Record<BotFile['kind'], { label: string; cls: string }> = {
  pdf: { label: 'PDF', cls: 'pdf' },
  xls: { label: 'XLS', cls: 'xls' },
  doc: { label: 'DOC', cls: 'doc' },
};

export function FilesSection({ files, onUpload }: Props) {
  const totalMB = (files.reduce((s, f) => s + f.sizeBytes, 0) / 1_000_000).toFixed(1);

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
          <span className="desc">PDFs, hojas de cálculo y docs que alimentan a la IA.</span>
        </div>
        <span className="chip">{files.length} archivos · {totalMB.replace('.', ',')} MB</span>
      </header>

      <div className="br-files">
        {files.map(f => {
          const k = KIND_STYLES[f.kind];
          const sizeLabel = f.sizeBytes >= 1_000_000
            ? `${(f.sizeBytes / 1_000_000).toFixed(1).replace('.', ',')} MB`
            : `${Math.round(f.sizeBytes / 1_000)} KB`;
          return (
            <div key={f.id} className="br-file">
              <div className={`br-file-kind ${k.cls}`}>{k.label}</div>
              <div className="br-file-meta">
                <div className="br-file-name">{f.name}</div>
                <div className="br-file-hint">{sizeLabel} · indexado {f.indexedAt}</div>
              </div>
              <span className={`br-badge ${f.status === 'active' ? 'ia' : 'neutral'}`}>
                {f.status === 'active' ? 'activo' : 'revisar'}
              </span>
            </div>
          );
        })}

        <label className="br-file br-file-upload">
          <div className="br-file-kind upload">↑</div>
          <div className="br-file-meta">
            <div className="br-file-name">Subir archivo</div>
            <div className="br-file-hint">PDF, DOCX, XLSX · hasta 10 MB</div>
          </div>
          <input
            type="file"
            accept=".pdf,.docx,.xlsx"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f && onUpload) onUpload(f); }}
          />
        </label>
      </div>
    </section>
  );
}
