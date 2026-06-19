import { useEffect, useState, useCallback } from "react";
import { superAdmin, type SuperUser } from "../api";
import { PageHeader, SurfaceCard, Skeleton } from "../components/ui";
import { useToast } from "../components/ui/Toast";

export default function SuperUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<SuperUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    superAdmin.users.list()
      .then(setUsers)
      .catch(() => toast("Error al cargar usuarios", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (user: SuperUser) => {
    try {
      const updated = await superAdmin.users.update(user.id, { enabled: !user.enabled });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, enabled: updated.enabled } : u));
      toast(updated.enabled ? "Usuario habilitado" : "Usuario deshabilitado", "success");
    } catch {
      toast("Error al actualizar usuario", "error");
    }
  };

  const changeRole = async (user: SuperUser, role: "admin" | "agent") => {
    try {
      const updated = await superAdmin.users.update(user.id, { role });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: updated.role } : u));
      toast("Rol actualizado", "success");
    } catch {
      toast("Error al actualizar rol", "error");
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Usuarios" subtitle="Todos los usuarios de la plataforma." />

      <div className="page-body">
        <SurfaceCard
          eyebrow="Plataforma"
          title="Usuarios registrados"
          description={loading ? "Cargando..." : `${users.length} ${users.length === 1 ? "usuario" : "usuarios"} en la plataforma.`}
          flush
        >
          {loading ? (
            <Skeleton variant="table-row" count={3} />
          ) : users.length === 0 ? (
            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>
              No hay usuarios registrados todavía.
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Empresa</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Alta</th>
                    <th style={{ width: "1%" }} aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={!u.enabled ? "is-disabled" : undefined}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                          <strong style={{ fontWeight: 600 }}>{u.name ?? "—"}</strong>
                          <span className="cell-muted" style={{ fontWeight: 400 }}>{u.email ?? "—"}</span>
                        </div>
                      </td>
                      <td>
                        {u.companies ? (
                          <span>{u.companies.name}</span>
                        ) : <span className="cell-muted">—</span>}
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as "admin" | "agent")}
                          style={{ fontSize: "0.85rem", padding: "0.2rem 0.4rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer" }}
                        >
                          <option value="admin">Admin</option>
                          <option value="agent">Agent</option>
                        </select>
                      </td>
                      <td>
                        {u.enabled
                          ? <span className="badge ai">Activo</span>
                          : <span className="badge">Deshabilitado</span>}
                      </td>
                      <td className="cell-muted">{fmtDate(u.created_at)}</td>
                      <td>
                        <button
                          onClick={() => toggle(u)}
                          style={{ fontSize: "0.8rem", padding: "0.2rem 0.55rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: u.enabled ? "var(--danger)" : "var(--success)", cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          {u.enabled ? "Deshabilitar" : "Habilitar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
