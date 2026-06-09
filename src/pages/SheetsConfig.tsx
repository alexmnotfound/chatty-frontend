import { useNavigate } from "react-router-dom";

const COLUMN_MAPPING = [
  { field: "Monto", column: "B", example: "$45.000,00" },
  { field: "Banco origen", column: "C", example: "Banco Galicia" },
  { field: "Fecha", column: "D", example: "25/04/2026" },
  { field: "Remitente", column: "E", example: "Valeria Torres" },
  { field: "CUIT remitente", column: "F", example: "27-31847265-4" },
  { field: "CBU destino", column: "G", example: "0170099..." },
  { field: "Referencia", column: "H", example: "00923841" },
  { field: "Concepto", column: "I", example: "Varios" },
];

const EXPORT_HISTORY = [
  { filename: "comprobante-transferencia-galicia.pdf", contact: "Valeria Torres", date: "25/04/2026 14:32", row: 47, status: "ok" },
  { filename: "transferencia-miercoles.jpg", contact: "Hernán Bravo", date: "23/04/2026 10:15", row: 46, status: "ok" },
  { filename: "transferencia-lunes.jpg", contact: "Hernán Bravo", date: "21/04/2026 09:48", row: 45, status: "ok" },
  { filename: "pago-marzo-2026.pdf", contact: "Cecilia Ríos", date: "31/03/2026 18:03", row: 44, status: "ok" },
  { filename: "recibo-febr-corrompido.pdf", contact: "Diego Fernández", date: "28/02/2026 11:20", row: "—", status: "error" },
];

export default function SheetsConfig() {
  const navigate = useNavigate();

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
          <strong>Configuración · Google Sheets</strong>
          <p className="panel-toolbar-sub">Destino de exportación de comprobantes procesados.</p>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: "56rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Connection status */}
        <article className="surface-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.5rem" }}>
                Conexión
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📊</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Pagos_2026.xlsx</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    Google Drive · compartido con admin@demo.com
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                background: "#dcfce7",
                color: "#16a34a",
                padding: "0.2rem 0.7rem",
                borderRadius: "99px",
              }}>
                ● Conectado
              </span>
              <button className="btn btn-ghost btn-sm">Desconectar</button>
            </div>
          </div>

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            {[
              { label: "Hoja de destino", value: "Comprobantes" },
              { label: "Fila de encabezados", value: "1" },
              { label: "Primera fila de datos", value: "2" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
                <input
                  defaultValue={value}
                  style={{
                    width: "100%",
                    padding: "0.35rem 0.6rem",
                    fontSize: "0.85rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
        </article>

        {/* Column mapping */}
        <article className="surface-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "1rem" }}>
            Mapeo de columnas
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: "0.5rem 1rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Campo</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Columna</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Ejemplo</span>
            <span />

            {COLUMN_MAPPING.map(({ field, column, example }) => (
              <>
                <span key={field + "-f"} style={{ fontSize: "0.85rem", fontWeight: 600 }}>{field}</span>
                <input
                  key={field + "-c"}
                  defaultValue={column}
                  style={{
                    width: "3rem",
                    padding: "0.3rem 0.5rem",
                    fontSize: "0.85rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontFamily: "inherit",
                    textAlign: "center",
                  }}
                />
                <span key={field + "-e"} style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{example}</span>
                <button key={field + "-x"} className="btn btn-ghost btn-sm" style={{ fontSize: "0.75rem" }}>✕</button>
              </>
            ))}
          </div>

          <button className="btn btn-ghost btn-sm" style={{ marginTop: "0.75rem" }}>+ Agregar campo</button>
        </article>

        {/* Export history */}
        <article className="surface-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "1rem" }}>
            Historial de exportaciones
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {EXPORT_HISTORY.map((item) => (
              <div key={item.filename} style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: "0.75rem",
                alignItems: "center",
                padding: "0.6rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.82rem",
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.filename}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{item.contact} · {item.date}</div>
                </div>
                <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                  {item.row !== "—" ? `Fila ${item.row}` : "—"}
                </span>
                <span style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "99px",
                  background: item.status === "ok" ? "#dcfce7" : "#fee2e2",
                  color: item.status === "ok" ? "#16a34a" : "#dc2626",
                }}>
                  {item.status === "ok" ? "Exportado" : "Error"}
                </span>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: "0.75rem" }}>Ver</button>
              </div>
            ))}
          </div>
        </article>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-primary">Guardar configuración</button>
          <button className="btn btn-ghost">Probar conexión</button>
        </div>
      </div>
    </div>
  );
}
