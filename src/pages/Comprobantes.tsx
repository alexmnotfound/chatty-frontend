import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Estado = "pendiente" | "revisado" | "exportado" | "error";

interface Comprobante {
  id: string;
  docId: string;
  filename: string;
  tipo: "pdf" | "imagen";
  contacto: string;
  monto: string;
  banco: string;
  fecha: string;
  detectado: string;
  estado: Estado;
}

const MOCK: Comprobante[] = [
  { id: "1", docId: "pdf-galicia",    filename: "comprobante-transferencia-galicia.pdf", tipo: "pdf",    contacto: "Valeria Torres", monto: "$45.000",  banco: "Galicia",   fecha: "25/04/2026", detectado: "hace 30 min", estado: "pendiente" },
  { id: "2", docId: "pdf-galicia",    filename: "pago-marzo-valeria.pdf",                tipo: "pdf",    contacto: "Valeria Torres", monto: "—",        banco: "—",         fecha: "—",          detectado: "hace 2 min",  estado: "pendiente" },
  { id: "3", docId: "img-bbva",       filename: "transferencia-lunes.jpg",               tipo: "imagen", contacto: "Hernán Bravo",   monto: "$12.500",  banco: "BBVA",      fecha: "21/04/2026", detectado: "hace 55 min", estado: "revisado"  },
  { id: "4", docId: "img-santander",  filename: "transferencia-miercoles.jpg",            tipo: "imagen", contacto: "Hernán Bravo",   monto: "$8.300",   banco: "Santander", fecha: "23/04/2026", detectado: "hace 50 min", estado: "revisado"  },
  { id: "5", docId: "pdf-galicia",    filename: "factura-abril.pdf",                     tipo: "pdf",    contacto: "Hernán Bravo",   monto: "—",        banco: "—",         fecha: "—",          detectado: "hace 10 min", estado: "error"     },
  { id: "6", docId: "pdf-galicia",    filename: "pago-marzo-2026.pdf",                   tipo: "pdf",    contacto: "Cecilia Ríos",   monto: "$32.000",  banco: "Nación",    fecha: "31/03/2026", detectado: "hace 3 días", estado: "exportado" },
];

const ESTADO_CONFIG: Record<Estado, { label: string; bg: string; color: string }> = {
  pendiente: { label: "Pendiente",  bg: "#fef9c3", color: "#a16207" },
  revisado:  { label: "Revisado",   bg: "#dbeafe", color: "#1d4ed8" },
  exportado: { label: "Exportado",  bg: "#dcfce7", color: "#16a34a" },
  error:     { label: "Error OCR",  bg: "#fee2e2", color: "#dc2626" },
};

const FILTROS: { key: Estado | "todos"; label: string }[] = [
  { key: "todos",     label: "Todos"     },
  { key: "pendiente", label: "Pendientes" },
  { key: "revisado",  label: "Revisados"  },
  { key: "exportado", label: "Exportados" },
  { key: "error",     label: "Con error"  },
];

export default function Comprobantes() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Estado | "todos">("todos");

  const lista = filtro === "todos" ? MOCK : MOCK.filter(c => c.estado === filtro);

  const counts = {
    pendiente: MOCK.filter(c => c.estado === "pendiente").length,
    revisado:  MOCK.filter(c => c.estado === "revisado").length,
    exportado: MOCK.filter(c => c.estado === "exportado").length,
    error:     MOCK.filter(c => c.estado === "error").length,
  };

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
      <div className="panel-toolbar panel-toolbar--page">
        <div className="panel-toolbar-text">
          <strong>Comprobantes</strong>
          <p className="panel-toolbar-sub">
            Documentos detectados en conversaciones · revisión y exportación a Google Sheets.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-ghost" onClick={() => navigate("/sheets-config")}>
            ⚙ Configurar Sheets
          </button>
          <button className="btn btn-primary">
            Exportar pendientes
          </button>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: "56rem" }}>

        {/* Stats strip */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0",
          background: "var(--surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "1.25rem",
          overflow: "hidden",
        }}>
          {(["pendiente", "revisado", "exportado", "error"] as Estado[]).map((e, i) => {
            const cfg = ESTADO_CONFIG[e];
            return (
              <div key={e} style={{
                padding: "1rem 1.25rem",
                borderRight: i < 3 ? "1px solid var(--border-subtle)" : "none",
              }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.25rem" }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>
                  {counts[e]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)" }}>
          {FILTROS.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: filtro === f.key ? 700 : 500,
                color: filtro === f.key ? "var(--accent)" : "var(--text-secondary)",
                background: "none",
                border: "none",
                borderBottom: filtro === f.key ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: "-1px",
              }}
            >
              {f.label}
              {f.key !== "todos" && counts[f.key as Estado] > 0 && (
                <span style={{
                  marginLeft: "0.4rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: filtro === f.key ? "var(--accent-dim)" : "var(--bg)",
                  color: filtro === f.key ? "var(--accent)" : "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "99px",
                  padding: "0 0.4rem",
                }}>
                  {counts[f.key as Estado]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {lista.map(c => {
            const cfg = ESTADO_CONFIG[c.estado];
            return (
              <div
                key={c.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.9rem 1.1rem",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto",
                  gap: "0.75rem 1rem",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>{c.tipo === "pdf" ? "📄" : "🖼️"}</span>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.filename}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                    {c.contacto}
                    {c.monto !== "—" && <> · <strong style={{ color: "var(--text)" }}>{c.monto}</strong></>}
                    {c.banco !== "—" && <> · {c.banco}</>}
                    {c.fecha !== "—" && <> · {c.fecha}</>}
                    <> · detectado {c.detectado}</>
                  </div>
                </div>

                <span style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "99px",
                  background: cfg.bg,
                  color: cfg.color,
                  whiteSpace: "nowrap",
                }}>
                  {cfg.label}
                </span>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/extractor/${c.docId}`)}
                >
                  Revisar
                </button>

                {c.estado !== "exportado" && c.estado !== "error" && (
                  <button className="btn btn-primary btn-sm">
                    Exportar
                  </button>
                )}
                {(c.estado === "exportado" || c.estado === "error") && (
                  <span style={{ width: "4.5rem" }} />
                )}
              </div>
            );
          })}

          {lista.length === 0 && (
            <p className="page-empty">No hay comprobantes en esta categoría.</p>
          )}
        </div>
      </div>
    </div>
  );
}
