import { useEffect, useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { tasks as tasksApi, team, type Task } from "../api";

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecha",
};

type View = "kanban" | "by-client";

export default function Tasks() {
  const navigate = useNavigate();
  const [list, setList] = useState<Task[]>([]);
  const [view, setView] = useState<View>("kanban");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterAssigned, setFilterAssigned] = useState<string>("");
  const [filterContact, setFilterContact] = useState<string>("");
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

  const filtered = filterContact.trim()
    ? list.filter((t) => {
        const q = filterContact.toLowerCase();
        const name = t.conversation?.contact?.name?.toLowerCase() ?? "";
        const waId = t.conversation?.contact?.waId?.toLowerCase() ?? "";
        return name.includes(q) || waId.includes(q);
      })
    : list;

  const tasksByStatus: Record<"pending" | "in_progress" | "done", Task[]> = {
    pending: [],
    in_progress: [],
    done: [],
  };
  for (const t of filtered) {
    if (t.status in tasksByStatus) tasksByStatus[t.status].push(t);
  }

  // Group by contact for by-client view
  const tasksByContact: Array<{ contactId: string; contactName: string; waId: string; tasks: Task[] }> = [];
  const contactMap = new Map<string, Task[]>();
  for (const t of filtered) {
    const cId = t.conversation?.contact?.waId ?? "unknown";
    if (!contactMap.has(cId)) contactMap.set(cId, []);
    contactMap.get(cId)!.push(t);
  }
  for (const [waId, tasks] of contactMap.entries()) {
    const contact = tasks[0].conversation?.contact;
    tasksByContact.push({
      contactId: waId,
      contactName: contact?.name ?? "",
      waId,
      tasks,
    });
  }
  // Sort: contacts with pending/in_progress first, then by name
  tasksByContact.sort((a, b) => {
    const aActive = a.tasks.filter((t) => t.status !== "done").length;
    const bActive = b.tasks.filter((t) => t.status !== "done").length;
    if (bActive !== aActive) return bActive - aActive;
    return (a.contactName || a.waId).localeCompare(b.contactName || b.waId);
  });

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
    e.preventDefault();
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
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
          <button
            type="button"
            className={`btn btn-ghost tasks-view-btn ${view === "kanban" ? "tasks-view-btn--active" : ""}`}
            onClick={() => setView("kanban")}
            title="Vista por estado"
          >
            Por estado
          </button>
          <button
            type="button"
            className={`btn btn-ghost tasks-view-btn ${view === "by-client" ? "tasks-view-btn--active" : ""}`}
            onClick={() => setView("by-client")}
            title="Vista por cliente"
          >
            Por cliente
          </button>
        </div>
      </div>

      <div style={{ padding: "1rem" }}>
        <div className="tasks-filter-bar">
          <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En curso</option>
            <option value="done">Hecha</option>
          </select>
          <select className="select" value={filterAssigned} onChange={(e) => setFilterAssigned(e.target.value)}>
            <option value="">Todos los agentes</option>
            {teamMembers
              .filter((m) => m.enabled)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
          <input
            className="select"
            type="search"
            placeholder="Buscar cliente o número…"
            value={filterContact}
            onChange={(e) => setFilterContact(e.target.value)}
            style={{ flex: 1, minWidth: "160px" }}
          />
          <span className="tasks-filter-count">
            {filtered.length} tarea{filtered.length === 1 ? "" : "s"}
          </span>
          {(filterStatus || filterAssigned || filterContact) && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ whiteSpace: "nowrap" }}
              onClick={() => { setFilterStatus(""); setFilterAssigned(""); setFilterContact(""); }}
            >
              Limpiar
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="empty">No hay tareas</p>
        ) : view === "kanban" ? (
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
                      <p className="page-empty" style={{ margin: 0 }}>Sin tareas</p>
                    ) : (
                      <div className="tasks-list">
                        {tasksByStatus[status].map((t) => (
                          <div
                            key={t.id}
                            className={`card task-card task-card--${t.status} ${draggingTaskId === t.id ? "is-dragging" : ""}`}
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
        ) : (
          <div className="tasks-by-client">
            {tasksByContact.map(({ contactId, contactName, waId, tasks }) => {
              const activeTasks = tasks.filter((t) => t.status !== "done");
              return (
                <article key={contactId} className="surface-card tasks-client-group">
                  <header className="tasks-client-group__header">
                    <div className="tasks-client-group__identity">
                      <strong className="tasks-client-group__name">
                        {contactName || waId}
                      </strong>
                      {contactName && (
                        <span className="tasks-client-group__waid">{waId}</span>
                      )}
                    </div>
                    <div className="tasks-client-group__badges">
                      {activeTasks.length > 0 && (
                        <span className="tasks-client-badge tasks-client-badge--active">
                          {activeTasks.length} activa{activeTasks.length === 1 ? "" : "s"}
                        </span>
                      )}
                      <span className="tasks-client-badge">
                        {tasks.length} total
                      </span>
                    </div>
                  </header>
                  <div className="tasks-client-group__list">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className="tasks-client-row"
                        onClick={() => navigate(`/tasks/${t.id}`)}
                      >
                        <span className={`task-status ${t.status}`} style={{ minWidth: "76px" }}>
                          {statusLabel[t.status] ?? t.status}
                        </span>
                        <span className="tasks-client-row__title">{t.title}</span>
                        <div className="tasks-client-row__meta">
                          {t.assignedTo && (
                            <span className="cell-muted">{t.assignedTo.name}</span>
                          )}
                          {t.dueAt && (
                            <span className="cell-muted">Vence {formatDate(t.dueAt)}</span>
                          )}
                        </div>
                        <select
                          className="select"
                          value={t.status}
                          onClick={(e) => e.stopPropagation()}
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
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
