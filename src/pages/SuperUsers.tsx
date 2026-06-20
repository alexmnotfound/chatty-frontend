import { useEffect, useState, useCallback, useMemo } from "react";
import { superAdmin, type SuperUser } from "../api";
import { PageHeader, SurfaceCard, Button, FormGroup, Skeleton } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { Plus, Copy } from "lucide-react";

type CreateForm = { email: string; name: string; password: string; companyId: string; role: "admin" | "agent" };
const emptyCreateForm: CreateForm = { email: "", name: "", password: "", companyId: "", role: "agent" };

export default function SuperUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<SuperUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);
  const [recovering, setRecovering] = useState<string | null>(null);

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
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: updated.enabled } : u));
      toast(updated.enabled ? "Usuario habilitado" : "Usuario deshabilitado", "success");
    } catch { toast("Error al actualizar usuario", "error"); }
  };

  const changeRole = async (user: SuperUser, role: "admin" | "agent") => {
    try {
      const updated = await superAdmin.users.update(user.id, { role });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: updated.role } : u));
      toast("Rol actualizado", "success");
    } catch { toast("Error al actualizar rol", "error"); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await superAdmin.users.create(createForm);
      toast("Usuario creado", "success");
      setShowCreate(false); setCreateForm(emptyCreateForm); setLoading(true); load();
    } catch (err) { toast(err instanceof Error ? err.message : "Error al crear usuario", "error"); }
    finally { setCreating(false); }
  };

  const handleRecovery = async (userId: string) => {
    if (recovering === userId) return;
    if (recoveryLink !== null) {
      if (!window.confirm("¿Generar un nuevo link? El anterior quedará inválido.")) return;
    }
    setRecovering(userId);
    try {
      const { link } = await superAdmin.users.generateRecovery(userId);
      setRecoveryLink(link);
    } catch { toast("Error al generar link de recuperación", "error"); }
    finally { setRecovering(null); }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

  const companies = useMemo(() =>
    Array.from(new Map(users.filter(u => u.companies).map(u => [u.companies!.id, u.companies!])).values()),
    [users]
  );

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Usuarios" subtitle="Todos los usuarios de la plataforma." />
      <div className="page-body">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <Button size="sm" disabled={loading} onClick={() => setShowCreate(true)}><Plus size={14} /> Nuevo usuario</Button>
        </div>

        {showCreate && (
          <SurfaceCard accent eyebrow="Nuevo" title="Crear usuario">
            <form onSubmit={handleCreate}>
              <FormGroup label="Email">
                {(props) => (
                  <input
                    className="form-input"
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    required
                    {...props}
                  />
                )}
              </FormGroup>
              <FormGroup label="Nombre">
                {(props) => (
                  <input
                    className="form-input"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    required
                    {...props}
                  />
                )}
              </FormGroup>
              <FormGroup label="Contraseña">
                {(props) => (
                  <input
                    className="form-input"
                    type="password"
                    value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                    {...props}
                  />
                )}
              </FormGroup>
              <FormGroup label="Empresa">
                {(props) => (
                  <select
                    className="form-input"
                    value={createForm.companyId}
                    onChange={e => setCreateForm(f => ({ ...f, companyId: e.target.value }))}
                    required
                    {...props}
                  >
                    <option value="">Seleccionar empresa...</option>
                    {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </FormGroup>
              <FormGroup label="Rol">
                {(props) => (
                  <select
                    className="form-input"
                    value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as "admin" | "agent" }))}
                    {...props}
                  >
                    <option value="agent">Agente</option>
                    <option value="admin">Administrador</option>
                  </select>
                )}
              </FormGroup>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="submit" disabled={creating}>{creating ? "Creando..." : "Crear"}</Button>
                <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
              </div>
            </form>
          </SurfaceCard>
        )}

        {recoveryLink && (
          <SurfaceCard accent eyebrow="Recuperación" title="Link de reset de contraseña">
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>Compartí este link con el usuario. Expira en 24h.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input className="form-input" value={recoveryLink} readOnly style={{ flex: 1, fontFamily: "monospace", fontSize: "0.8rem" }} />
              <Button size="sm" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(recoveryLink);
                  toast("Copiado", "success");
                } catch {
                  toast("No se pudo copiar al portapapeles", "error");
                }
              }}>
                <Copy size={14} />
              </Button>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <Button variant="ghost" size="sm" onClick={() => setRecoveryLink(null)}>Cerrar</Button>
            </div>
          </SurfaceCard>
        )}

        <SurfaceCard
          eyebrow="Plataforma"
          title="Usuarios registrados"
          description={loading ? "Cargando..." : `${users.length} ${users.length === 1 ? "usuario" : "usuarios"} en la plataforma.`}
          flush
        >
          {loading ? (
            <Skeleton variant="table-row" count={3} />
          ) : users.length === 0 ? (
            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>No hay usuarios registrados todavía.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th><th>Empresa</th><th>Rol</th><th>Estado</th><th>Alta</th>
                    <th style={{ width: "1%" }} aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={!u.enabled ? "is-disabled" : undefined}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                          <strong style={{ fontWeight: 600 }}>{u.name ?? "—"}</strong>
                          <span className="cell-muted" style={{ fontWeight: 400 }}>{u.email ?? "—"}</span>
                        </div>
                      </td>
                      <td className="cell-muted">{(u as any).companies?.name ?? "—"}</td>
                      <td>
                        <select className="form-input" style={{ padding: "0.2rem 0.4rem", fontSize: "0.85rem" }} value={u.role} onChange={e => changeRole(u, e.target.value as "admin" | "agent")}>
                          <option value="agent">Agente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                      <td>{u.enabled ? <span className="badge ai">Activo</span> : <span className="badge">Deshabilitado</span>}</td>
                      <td className="cell-muted">{fmtDate(u.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button onClick={() => toggle(u)} style={{ fontSize: "0.8rem", background: "none", border: `1px solid ${u.enabled ? "var(--danger, #ef4444)" : "var(--border-subtle)"}`, color: u.enabled ? "var(--danger, #ef4444)" : "inherit", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                            {u.enabled ? "Deshabilitar" : "Habilitar"}
                          </button>
                          <button onClick={() => handleRecovery(u.id)} disabled={recovering === u.id} style={{ fontSize: "0.8rem", background: "none", border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: recovering === u.id ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                            Reset
                          </button>
                        </div>
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
