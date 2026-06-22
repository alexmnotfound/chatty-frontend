import { toast } from "../lib/toast";
import { useEffect, useMemo, useState } from "react";
import { metrics, audit, type ActivityLog, type DashboardMetrics } from "../api";
import { SurfaceCard, Skeleton, PageHeader, Pagination } from "../components/ui";

function truncate(s: string, maxLen: number) {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + "…";
}

function actionLabel(action: string) {
  switch (action) {
    case "conversation.read_state":
      return "Marcar leído/no leído";
    case "conversation.take_over":
      return "Tomar conversación";
    case "conversation.release_to_ai":
      return "Devolver a IA";
    case "conversation.set_ai_role":
      return "Cambiar rol IA";
    case "message.human_send":
      return "Mensaje enviado";
    case "message.incoming":
      return "Mensaje entrante";
    case "message.ai_reply":
      return "Respuesta IA";
    case "task.create":
      return "Tarea creada";
    case "task.update":
      return "Tarea actualizada";
    case "task.delete":
      return "Tarea eliminada";
    default:
      return action;
  }
}

export default function Dashboard() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<DashboardMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const logPageSize = 25;

  useEffect(() => {
    setError("");
    setLoading(true);
    Promise.all([
      metrics.dashboard({ days: 30 }),
      audit.list({ limit: logPageSize, offset: (logPage - 1) * logPageSize }),
    ])
      .then(([m, a]) => {
        setMetricsData(m);
        setRecentLogs(a.logs);
        setLogTotal(a.total);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Error cargando el dashboard";
        setError(msg);
        toast(msg, "error");
      })
      .finally(() => setLoading(false));
  }, [toast, logPage]);

  const metricsCards = useMemo(() => {
    const m = metricsData;
    if (!m) return null;

    return (
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <article className="surface-card">
          <header className="surface-card__head">
            <span className="surface-card__eyebrow">Conversaciones</span>
            <h2 className="surface-card__title">{m.conversations.total}</h2>
            <p className="surface-card__desc">IA: {m.conversations.ai} · Humanos: {m.conversations.human} · No leídas: {m.conversations.unreadTotal}</p>
          </header>
        </article>

        <article className="surface-card">
          <header className="surface-card__head">
            <span className="surface-card__eyebrow">Tareas</span>
            <h2 className="surface-card__title">{m.tasks.total}</h2>
            <p className="surface-card__desc">Pendientes: {m.tasks.pending} · En curso: {m.tasks.in_progress} · Hechas: {m.tasks.done}</p>
          </header>
        </article>

        <article className="surface-card">
          <header className="surface-card__head">
            <span className="surface-card__eyebrow">Tareas (30 días)</span>
            <h2 className="surface-card__title">{m.tasks.doneInRange}</h2>
            <p className="surface-card__desc">Hechas en el rango · Creadas: {m.tasks.createdInRange}</p>
          </header>
        </article>

        <article className="surface-card">
          <header className="surface-card__head">
            <span className="surface-card__eyebrow">Actividad (30 días)</span>
            <h2 className="surface-card__title">{m.activity.totalEventsInRange}</h2>
            <p className="surface-card__desc">Eventos del rango: conversaciones y tareas</p>
          </header>
        </article>
      </div>
    );
  }, [metricsData]);

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader
        title="Dashboard"
        subtitle="Métricas y actividad reciente de conversaciones y tareas."
      />

      <div className="page-body">
        {error && <div className="page-alert">{error}</div>}

        {loading && (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <Skeleton variant="card" count={4} />
          </div>
        )}

        {!loading && metricsCards}

        {!loading && metricsData && (
          <SurfaceCard
            eyebrow="Actividad por usuario"
            title="Top del mes"
            description="Quién más participó creando/actualizando conversaciones y tareas."
          >
            {metricsData.activity.topActors.length === 0 ? (
              <p className="page-empty" style={{ margin: 0 }}>
                Todavía no hay actividad registrada.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {metricsData.activity.topActors.map((t) => (
                  <div key={t.actor.id} className="appearance-row" style={{ padding: "0.25rem 0" }}>
                    <div className="appearance-row__text">
                      <strong>{t.actor.name}</strong>
                      <span className="cell-muted">{t.actor.role === "admin" ? "Admin" : "Agente"}</span>
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{t.events} eventos</div>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        )}

        {!loading && metricsData && (
          <SurfaceCard
            eyebrow="Actividad reciente"
            title="Últimos eventos"
            description={'Trackeo de "quién hizo qué" en conversaciones y tareas.'}
          >
            {recentLogs.length === 0 ? (
              <p className="page-empty" style={{ margin: 0 }}>
                No hay eventos para mostrar.
              </p>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table" role="table" aria-label="Actividad reciente">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Actor</th>
                      <th>Acción</th>
                      <th>Entidad</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((l) => {
                      const actor = l.actor ? l.actor.name : "Sistema";
                      const metaText =
                        l.meta != null ? truncate(JSON.stringify(l.meta), 120) : l.metaRaw ? truncate(l.metaRaw, 120) : "—";

                      return (
                        <tr key={l.id}>
                          <td className="cell-muted">
                            {new Date(l.createdAt).toLocaleString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>
                            <strong style={{ fontWeight: 600 }}>{actor}</strong>
                          </td>
                          <td>{actionLabel(l.action)}</td>
                          <td className="cell-muted">
                            {l.entityType}
                            {l.entityId ? ` · ${l.entityId}` : ""}
                          </td>
                          <td className="cell-muted">{metaText}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={logPage} pageSize={logPageSize} total={logTotal} onPageChange={setLogPage} />
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
