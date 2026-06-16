import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { conversations, aiRoles, team, tasks, bots as botsApi, emitInboxUnreadChanged, type Conversation, type AiRole, type Bot } from "../api";

export default function Inbox() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [roles, setRoles] = useState<AiRole[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string; enabled: boolean }>>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssign, setNewTaskAssign] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "ai" | "human" | "unread">("");
  const [botList, setBotList] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>("");

  const filteredList = useMemo(() => {
    let items = list;
    if (filterStatus === "unread") items = items.filter((c) => c.unreadCount > 0);
    else if (filterStatus === "ai") items = items.filter((c) => c.status === "ai");
    else if (filterStatus === "human") items = items.filter((c) => c.status === "human");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (c) =>
          (c.contact.name || "").toLowerCase().includes(q) ||
          c.contact.waId.includes(q) ||
          (c.messages[0]?.body || "").toLowerCase().includes(q)
      );
    }
    return items;
  }, [list, searchQuery, filterStatus]);

  const getUnreadTotal = (arr: Conversation[]) => arr.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const upsertConversation = (updated: Conversation) => {
    setList((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      const next = exists ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated, ...prev];
      emitInboxUnreadChanged(getUnreadTotal(next));
      return next;
    });
  };

  const load = () => {
    conversations.list().then((items) => {
      setList(items);
      emitInboxUnreadChanged(getUnreadTotal(items));
    });
    aiRoles.list().then(setRoles);
    team.list().then(setTeamMembers);
  };

  useEffect(() => {
    load();
    botsApi.list().then(setBotList).catch(console.error);
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setSelected(null);
      return;
    }
    conversations.get(conversationId)
      .then((updated) => {
        setSelected(updated);
        upsertConversation(updated);
        if (updated.unreadCount > 0) {
          const optimisticRead = { ...updated, unreadCount: 0 };
          setSelected(optimisticRead);
          upsertConversation(optimisticRead);
          conversations.setReadState(updated.id, false).then((readUpdated) => {
            setSelected(readUpdated);
            upsertConversation(readUpdated);
          });
        }
      })
      .catch(() => setSelected(null));
  }, [conversationId]);

  const open = (c: Conversation) => navigate(`/inbox/${c.id}`);
  const takeOver = () => {
    if (!selected) return;
    conversations.takeOver(selected.id, true).then((updated) => {
      setSelected(updated);
      setList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    });
  };
  const releaseToAi = () => {
    if (!selected) return;
    conversations.releaseToAi(selected.id).then((updated) => {
      setSelected(updated);
      upsertConversation(updated);
    });
  };
  const setAiRole = (aiRoleId: string) => {
    if (!selected) return;
    conversations.setAiRole(selected.id, aiRoleId).then((updated) => {
      setSelected(updated);
      setList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    });
  };
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    try {
      await conversations.send(selected.id, reply.trim());
      setReply("");
      const updated = await conversations.get(selected.id);
      setSelected(updated);
      setList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } finally {
      setSending(false);
    }
  };
  const toggleReadState = () => {
    if (!selected) return;
    const markAsUnread = selected.unreadCount === 0;
    const optimistic = { ...selected, unreadCount: markAsUnread ? 1 : 0 };
    setSelected(optimistic);
    upsertConversation(optimistic);
    conversations.setReadState(selected.id, markAsUnread).then((updated) => {
      setSelected(updated);
      upsertConversation(updated);
    });
  };
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !newTaskTitle.trim() || creatingTask) return;
    setCreatingTask(true);
    try {
      await tasks.create({
        conversationId: selected.id,
        title: newTaskTitle.trim(),
        assignedToId: newTaskAssign || undefined,
      });
      const updated = await conversations.get(selected.id);
      setSelected(updated);
      upsertConversation(updated);
      setShowNewTask(false);
      setNewTaskTitle("");
      setNewTaskAssign("");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleHandoff = async (botId: string | null) => {
    if (!selected) return;
    try {
      await conversations.handoff(selected.id, botId);
      const updated = await conversations.get(selected.id);
      setSelected(updated);
      upsertConversation(updated);
    } catch (e) {
      console.error("Handoff failed", e);
    }
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) return dt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }) + " " + dt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`inbox-layout ${conversationId ? "has-conversation" : ""}`}>
      <aside className="inbox-sidebar" style={{ width: 280 }}>
        <div className="inbox-search">
          <Search size={16} className="inbox-search-icon" />
          <input
            type="text"
            placeholder="Buscar conversación…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="inbox-search-input"
          />
        </div>
        <div className="inbox-filters">
          {(["", "unread", "ai", "human"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`inbox-filter-chip ${filterStatus === f ? "active" : ""}`}
              onClick={() => setFilterStatus(f)}
            >
              {f === "" ? "Todas" : f === "unread" ? "No leídas" : f === "ai" ? "IA" : "Humano"}
            </button>
          ))}
        </div>
        {filteredList.length === 0 ? (
          <p className="empty">{list.length === 0 ? "Sin conversaciones" : "Sin resultados"}</p>
        ) : (
          filteredList.map((c) => (
            <div
              key={c.id}
              className={`list-item ${selected?.id === c.id ? "active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => open(c)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(c); } }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{c.contact.name || c.contact.waId}</strong>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  {c.unreadCount > 0 && <span className="unread-badge">{c.unreadCount}</span>}
                  <span className={`badge ${c.status === "ai" ? "ai" : "human"}`}>{c.status === "ai" ? "IA" : "Humano"}</span>
                </div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                {c.messages[0]?.body?.slice(0, 50) ?? "—"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                {formatDate(c.updatedAt)}
              </div>
            </div>
          ))
        )}
      </aside>
      <div className="panel" style={{ flex: 1, minWidth: 0 }}>
        {!selected ? (
          <div className="empty" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            Seleccioná una conversación
          </div>
        ) : (
          <>
            <div className="panel-toolbar" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm inbox-back-btn"
                onClick={() => navigate("/inbox")}
              >
                <ArrowLeft size={18} />
              </button>
              <span style={{ fontWeight: 600 }}>{selected.contact.name || selected.contact.waId}</span>
              <span className={`badge ${selected.status === "ai" ? "ai" : "human"}`}>
                {selected.status === "ai" ? "IA" : "Humano"}
              </span>
              {selected.assignedTo && <span className="badge">Asignado: {selected.assignedTo.name}</span>}
              {selected.status === "ai" && (
                <button type="button" className="btn btn-primary btn-sm" onClick={takeOver}>
                  Tomar conversación
                </button>
              )}
              {selected.status === "human" && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={releaseToAi}>
                  Devolver a IA
                </button>
              )}
              {selected.status === "ai" && roles.length > 0 && (
                <select
                  className="select"
                  value={selected.aiRoleId ?? ""}
                  onChange={(e) => e.target.value && setAiRole(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowNewTask(true)}>
                + Nueva tarea
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={toggleReadState}>
                {selected.unreadCount > 0 ? "Marcar como leída" : "Marcar como no leída"}
              </button>
            </div>
            {showNewTask && (
              <form onSubmit={createTask} className="card" style={{ margin: "1rem" }}>
                <h3 style={{ marginTop: 0 }}>Nueva tarea</h3>
                <div className="form-group">
                  <label>Título</label>
                  <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Asignar a</label>
                  <select
                    className="select"
                    value={newTaskAssign}
                    onChange={(e) => setNewTaskAssign(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 0.65rem" }}
                  >
                    <option value="">—</option>
                    {teamMembers
                      .filter((m) => m.enabled)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" className="btn btn-primary" disabled={creatingTask}>Crear</button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowNewTask(false); setNewTaskTitle(""); setNewTaskAssign(""); }}>Cancelar</button>
                </div>
              </form>
            )}
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <strong style={{ fontSize: "0.86rem" }}>Tareas asociadas</strong>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/tasks")}>
                  Ver todas
                </button>
              </div>
              {!selected.tasks || selected.tasks.length === 0 ? (
                <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Sin tareas asociadas</span>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {selected.tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <span>{task.title}</span>
                      <span className={`task-status ${task.status}`}>
                        {task.status === "pending" ? "Pendiente" : task.status === "in_progress" ? "En curso" : "Hecha"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="msg-list whatsapp-chat-bg">
              {selected.messages.map((m) => {
                const attachMatch = m.body.match(/^\[(PDF|IMAGEN):([^\]]+)\]$/);
                if (attachMatch) {
                  const isImg = attachMatch[1] === "IMAGEN";
                  const filename = attachMatch[2];
                  const docId = isImg
                    ? (filename.includes("miercoles") ? "img-santander" : "img-bbva")
                    : "pdf-galicia";
                  return (
                    <div key={m.id} className={`msg ${m.direction === "out" ? "out" : "in"}`}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <span>{isImg ? "🖼️" : "📄"}</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{filename}</span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/extractor/${docId}`)}
                        style={{ fontSize: "0.78rem" }}
                      >
                        Extraer datos
                      </button>
                      <div className="msg-meta">{formatDate(m.createdAt)}</div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={`msg ${m.direction === "out" ? "out" : "in"} ${m.fromAi ? "bot" : ""}`}>
                    <div>{m.body}</div>
                    <div className="msg-meta">
                      {formatDate(m.createdAt)} {m.fromAi && " (IA)"}
                    </div>
                  </div>
                );
              })}
            </div>
            {selected?.status === "ai" && (
            <div style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid var(--border)" }}>
              <select
                value={selectedBotId}
                onChange={(e) => setSelectedBotId(e.target.value)}
                style={{ fontSize: "13px", padding: "6px 8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg)", color: "var(--text)", flex: 1 }}
              >
                <option value="">Transferir a humano</option>
                {botList.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleHandoff(selectedBotId || null)}
                style={{ fontSize: "13px", padding: "6px 12px", border: "1px solid var(--accent)", borderRadius: "6px", background: "transparent", color: "var(--accent)", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Transferir
              </button>
            </div>
            )}
            {selected.status === "human" && (
              <form className="reply-form" onSubmit={send}>
                <input
                  type="text"
                  placeholder="Escribí un mensaje..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !reply.trim()}>Enviar</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
