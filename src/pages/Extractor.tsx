import { useNavigate, useParams } from "react-router-dom";

interface ExtractedField {
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
}

const MOCK_EXTRACTIONS: Record<string, { filename: string; type: "pdf" | "image"; fields: ExtractedField[] }> = {
  "pdf-galicia": {
    filename: "comprobante-transferencia-galicia.pdf",
    type: "pdf",
    fields: [
      { label: "Monto", value: "$45.000,00", confidence: "high" },
      { label: "Banco origen", value: "Banco Galicia", confidence: "high" },
      { label: "Fecha", value: "25/04/2026", confidence: "high" },
      { label: "Remitente", value: "Valeria Torres", confidence: "high" },
      { label: "CUIT remitente", value: "27-31847265-4", confidence: "medium" },
      { label: "CBU destino", value: "0170099340000012345678", confidence: "high" },
      { label: "Referencia", value: "00923841", confidence: "high" },
      { label: "Concepto", value: "Varios", confidence: "medium" },
    ],
  },
  "img-bbva": {
    filename: "transferencia-lunes.jpg",
    type: "image",
    fields: [
      { label: "Monto", value: "$12.500,00", confidence: "high" },
      { label: "Banco origen", value: "BBVA", confidence: "high" },
      { label: "Fecha", value: "21/04/2026", confidence: "high" },
      { label: "Remitente", value: "Hernán Bravo", confidence: "medium" },
      { label: "CUIT remitente", value: "20-28491023-7", confidence: "low" },
      { label: "Referencia", value: "00847261", confidence: "high" },
      { label: "Concepto", value: "Servicios", confidence: "medium" },
    ],
  },
  "img-santander": {
    filename: "transferencia-miercoles.jpg",
    type: "image",
    fields: [
      { label: "Monto", value: "$8.300,00", confidence: "high" },
      { label: "Banco origen", value: "Santander", confidence: "high" },
      { label: "Fecha", value: "23/04/2026", confidence: "high" },
      { label: "Remitente", value: "Hernán Bravo", confidence: "high" },
      { label: "Referencia", value: "00851034", confidence: "high" },
      { label: "Concepto", value: "Honorarios", confidence: "medium" },
    ],
  },
};

const DEFAULT_EXTRACTION = MOCK_EXTRACTIONS["pdf-galicia"];

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export default function Extractor() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const data = (docId && MOCK_EXTRACTIONS[docId]) ? MOCK_EXTRACTIONS[docId] : DEFAULT_EXTRACTION;

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
      <div className="panel-toolbar panel-toolbar--page">
        <div className="panel-toolbar-text">
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: "0.25rem" }}
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>
          <strong>Extracción de comprobante</strong>
          <p className="panel-toolbar-sub">
            {data.type === "pdf" ? "📄" : "🖼️"} {data.filename}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/sheets-config")}>
            Configurar Sheets
          </button>
          <button className="btn btn-primary">
            Exportar a Google Sheets
          </button>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: "56rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>

          {/* Document preview */}
          <article className="surface-card" style={{ padding: "1.25rem" }}>
            <header style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
                Vista previa
              </span>
            </header>
            <div style={{
              background: "var(--bg)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              minHeight: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              color: "var(--muted)",
              padding: "2rem",
            }}>
              <span style={{ fontSize: "3rem" }}>{data.type === "pdf" ? "📄" : "🖼️"}</span>
              <span style={{ fontSize: "0.85rem", textAlign: "center" }}>{data.filename}</span>
              <span style={{
                fontSize: "0.75rem",
                background: "var(--accent-dim)",
                color: "var(--accent)",
                padding: "0.2rem 0.6rem",
                borderRadius: "99px",
                fontWeight: 600,
              }}>
                {data.fields.length} campos detectados
              </span>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>Confianza por campo</div>
              {["high", "medium", "low"].map(level => {
                const count = data.fields.filter(f => f.confidence === level).length;
                if (!count) return null;
                const colors: Record<string, string> = { high: "#16a34a", medium: "#d97706", low: "#dc2626" };
                return (
                  <div key={level} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[level], flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)" }}>{CONFIDENCE_LABEL[level]}</span>
                    <span style={{ marginLeft: "auto", fontWeight: 600 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Extracted fields */}
          <article className="surface-card" style={{ padding: "1.25rem" }}>
            <header style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
                Datos extraídos
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Editables</span>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.fields.map((field) => {
                const dotColor: Record<string, string> = { high: "#16a34a", medium: "#d97706", low: "#dc2626" };
                return (
                  <div key={field.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {field.label}
                      </label>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: "var(--muted)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor[field.confidence] }} />
                        {CONFIDENCE_LABEL[field.confidence]}
                      </span>
                    </div>
                    <input
                      defaultValue={field.value}
                      style={{
                        width: "100%",
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.875rem",
                        border: `1px solid ${field.confidence === "low" ? "#fca5a5" : "var(--border-subtle)"}`,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg)",
                        color: "var(--text)",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate("/sheets-config")}>
                Exportar a Sheets ↗
              </button>
              <button className="btn btn-ghost">Descartar</button>
            </div>
          </article>

        </div>
      </div>
    </div>
  );
}
