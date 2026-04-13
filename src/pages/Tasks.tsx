import { useEffect, useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { tasks as tasksApi, team, type Task } from "../api";

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecha",
};

export default function Tasks() {
  const navigate = useNavigate();
  const [list, setList] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterAssigned, setFilterAssigned] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; enabled: boolean }>>([]);
  const [dragOverStatus, setDragOverStatus] = useState<"pending" | "in_progress" | "done" | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const draggedTaskIdRef = useRef<string | null>(null);

  const load = () => {
    const params: { status?: string; assignedToId?: string } = {};
    if (filterStatus) params.status = filterStatus;
    if (filterAssigned) params.assignedToId = filterAssigned;
    tasksApi.list(params).then(setList);
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterAssigned]);

  useEffect(() => {
    team.list().then((m) => setTeamMembers(m));
  }, []);

  const statuses: Array<"pending" | "in_progress" | "done"> = ["pending", "in_progress", "done"];
  const visibleStatuses: Array<"pending" | "in_progress" | "done"> =
    filterStatus && (statuses as string[]).includes(filterStatus) ? [filterStatus as typeof statuses[number]] : statuses;

  const tasksByStatus: Record<"pending" | "in_progress" | "done", Task[]> = {
    pending: [],
    in_progress: [],
    done: [],
  };
  for (const t of list) {
    if (t.status in tasksByStatus) tasksByStatus[t.status].push(t);
  }

  const updateStatus = (task: Task, status: "pending" | "in_progress" | "done") => {
    tasksApi.update(task.id, { status }).then((updated) => {
      setList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });
  };

  const onTaskDragStart = (e: DragEvent, task: Task) => {
    isDraggingRef.current = true;
    draggedTaskIdRef.current = task.id;
    setDraggingTaskId(task.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ taskId: task.id }));
  };

  const onTaskDragEnd = () => {
    isDraggingRef.current = false;
    draggedTaskIdRef.current = null;
    setDraggingTaskId(null);
    setDragOverStatus(null);
  };

  const onColumnDragOver = (e: DragEvent, status: "pending" | "in_progress" | "done") => {
    e.preventDefault(); // Required to allow dropping
    setDragOverStatus(status);
    e.dataTransfer.dropEffect = "move";
  };

  const onColumnDrop = (e: DragEvent, statusTo: "pending" | "in_progress" | "done") => {
    e.preventDefault();
    setDragOverStatus(null);

    const raw = e.dataTransfer.getData("text/plain");
    let parsed: { taskId?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      // ignore
    }
    const taskId = parsed.taskId ?? draggedTaskIdRef.current;
    if (!taskId) return;

    const task = list.find((t) => t.id === taskId);
    if (!task) return;
    if (task.status === statusTo) return;

    updateStatus(task, statusTo);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <div className="panel-toolbar">
        <strong>Tareas</strong>
      </div>

      <div style={{ padding: "1rem" }}>
        <article className="surface-card" style={{ marginBottom: "1rem" }}>
          <header className="surface-card__head">
            <span className="surface-card__eyebrow">Filtros</span>
            <h2 className="surface-card__title" style={{ fontSize: "1rem" }}>
              Buscá por estado y asignación
            </h2>
          </header>
          <div className="surface-card__body surface-card__body--tight">
            <div className="form-grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Estado</label>
                <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Todas (3 columnas)</option>
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En curso</option>
                  <option value="done">Hecha</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Asignado</label>
                <select className="select" value={filterAssigned} onChange={(e) => setFilterAssigned(e.target.value)}>
                  <option value="">Todos</option>
                  {teamMembers
                    .filter((m) => m.enabled)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="form-actions" style={{ justifyContent: "space-between" }}>
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {list.length} tarea{list.length === 1 ? "" : "s"} en la vista
              </div>
              {(filterStatus || filterAssigned) && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setFilterStatus("");
                    setFilterAssigned("");
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </article>

        {list.length === 0 ? (
          <p className="empty">No hay tareas</p>
        ) : (
          <article className="surface-card">
            <div className="tasks-columns">
              {visibleStatuses.map((status) => (
                <section key={status} className={`tasks-column ${dragOverStatus === status ? "is-over" : ""}`}>
                  <div className="tasks-column-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className={`task-status ${status}`}>{statusLabel[status] ?? status}</span>
                      <span className="tasks-column-count">{tasksByStatus[status]?.length ?? 0}</span>
                    </div>
                  </div>

                  <div
                    className="tasks-column-body"
                    onDragOver={(e) => onColumnDragOver(e, status)}
                    onDrop={(e) => onColumnDrop(e, status)}
                  >
                    {tasksByStatus[status].length === 0 ? (
                      <p className="page-empty" style={{ margin: 0 }}>
                        Sin tareas
                      </p>
                    ) : (
                      <div className="tasks-list">
                        {tasksByStatus[status].map((t) => (
                          <div
                            key={t.id}
                            className={`card task-card ${draggingTaskId === t.id ? "is-dragging" : ""}`}
                            style={{ cursor: "pointer", marginBottom: "0.75rem" }}
                            draggable
                            onDragStart={(e) => onTaskDragStart(e, t)}
                            onDragEnd={onTaskDragEnd}
                            onClick={() => {
                              if (isDraggingRef.current) return;
                              navigate(`/tasks/${t.id}`);
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                              <div>
                                <strong>{t.title}</strong>
                                {t.conversation?.contact && (
                                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {t.conversation.contact.name || t.conversation.contact.waId}
                                  </div>
                                )}
                                {t.assignedTo && (
                                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                                    Asignado: {t.assignedTo.name}
                                  </div>
                                )}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <select
                                  className="select"
                                  value={t.status}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateStatus(t, e.target.value as "pending" | "in_progress" | "done");
                                  }}
                                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.45rem" }}
                                >
                                  <option value="pending">Pendiente</option>
                                  <option value="in_progress">En curso</option>
                                  <option value="done">Hecha</option>
                                </select>
                              </div>
                            </div>

                            {t.dueAt && (
                              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.35rem" }}>
                                Vence: {formatDate(t.dueAt)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
