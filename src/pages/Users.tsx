import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { team, type MemberRole, type TeamMemberRow } from "../api";
import { useAuth } from "../AuthContext";
import { Button, FormGroup, SurfaceCard, Skeleton, PageHeader, ConfirmDialog } from "../components/ui";
import { useToast } from "../components/ui/Toast";

const roleLabel: Record<MemberRole, string> = {
  admin: "Administrador",
  agent: "Agente",
};

export default function Users() {
  const { member, setMember } = useAuth();
  const [rows, setRows] = useState<TeamMemberRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<MemberRole>("agent");

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<TeamMemberRow | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const validateNewName = (val: string) => {
    if (!val.trim()) return "El nombre es obligatorio";
    return "";
  };
  const validateNewEmail = (val: string) => {
    if (!val) return "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "El email no es válido";
    return "";
  };
  const validateNewPassword = (val: string) => {
    if (!val) return "La contraseña es obligatoria";
    if (val.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return "";
  };

  const load = useCallback(() => {
    setError("");
    return team.list().then(setRows).catch((e) => {
      const msg = e instanceof Error ? e.message : "Error al cargar";
      setError(msg);
      toast(msg, "error");
    });
  }, [toast]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  if (member?.role !== "admin") {
    return <Navigate to="/inbox" replace />;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const newErrors: Record<string, string> = {};
    const nameErr = validateNewName(newName);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateNewEmail(newEmail);
    if (emailErr) newErrors.email = emailErr;
    const passwordErr = validateNewPassword(newPassword);
    if (passwordErr) newErrors.password = passwordErr;
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setCreating(true);
    try {
      const created = await team.create({
        email: newEmail,
        password: newPassword,
        name: newName,
        role: newRole,
      });
      setRows((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewRole("agent");
      setFormErrors({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
      toast(msg, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (row: TeamMemberRow, role: MemberRole) => {
    setError("");
    try {
      const updated = await team.update(row.id, { role });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (member.id === updated.id) {
        setMember({ ...member, role: updated.role });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
      toast(msg, "error");
    }
  };

  const handleEnabledChange = async (row: TeamMemberRow, enabled: boolean) => {
    setError("");
    try {
      const updated = await team.update(row.id, { enabled });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (member.id === updated.id) {
        setMember({ ...member, enabled: updated.enabled });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
      toast(msg, "error");
    }
  };

  const requestDelete = (row: TeamMemberRow) => {
    setPendingDeleteRow(row);
    setConfirmingDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteRow) return;
    const row = pendingDeleteRow;
    setConfirmingDelete(false);
    setPendingDeleteRow(null);
    setError("");
    try {
      await team.remove(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setError(msg);
      toast(msg, "error");
    }
  };

  const handleDeleteCancel = () => {
    setConfirmingDelete(false);
    setPendingDeleteRow(null);
  };

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader
        title="Usuarios del equipo"
        subtitle="Invitá cuentas, asigná rol de administrador o agente, y activá o desactivá el acceso sin borrar el historial."
      />

      <div className="page-body">
        {error && <div className="page-alert">{error}</div>}

        <SurfaceCard
          eyebrow="Alta"
          title="Invitar usuario"
          description="La persona podrá iniciar sesión con el email y la contraseña que definas acá."
          accent
        >
          <form onSubmit={handleCreate}>
            <div className="form-grid-2">
              <FormGroup label="Nombre" error={formErrors.name}>
                {(props) => (
                  <input
                    {...props}
                    value={newName}
                    onChange={(e) => { setNewName(e.target.value); setFormErrors((prev) => ({ ...prev, name: "" })); }}
                    onBlur={() => { const err = validateNewName(newName); if (err) setFormErrors((prev) => ({ ...prev, name: err })); }}
                    required
                    autoComplete="name"
                  />
                )}
              </FormGroup>
              <FormGroup label="Email" error={formErrors.email}>
                {(props) => (
                  <input
                    {...props}
                    type="email"
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setFormErrors((prev) => ({ ...prev, email: "" })); }}
                    onBlur={() => { const err = validateNewEmail(newEmail); if (err) setFormErrors((prev) => ({ ...prev, email: err })); }}
                    required
                    autoComplete="off"
                  />
                )}
              </FormGroup>
            </div>
            <div className="form-grid-2">
              <FormGroup label="Contraseña inicial" error={formErrors.password}>
                {(props) => (
                  <input
                    {...props}
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setFormErrors((prev) => ({ ...prev, password: "" })); }}
                    onBlur={() => { const err = validateNewPassword(newPassword); if (err) setFormErrors((prev) => ({ ...prev, password: err })); }}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                )}
              </FormGroup>
              <FormGroup label="Rol">
                {(props) => (
                  <select
                    {...props}
                    className="select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as MemberRole)}
                    style={{ width: "100%" }}
                  >
                    <option value="agent">Agente</option>
                    <option value="admin">Administrador</option>
                  </select>
                )}
              </FormGroup>
            </div>
            <div className="form-actions">
              <Button type="submit" variant="primary" loading={creating}>
                {creating ? "Creando…" : "Crear usuario"}
              </Button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Equipo"
          title="Miembros activos"
          description={loading ? "Cargando…" : `${rows.length} ${rows.length === 1 ? "persona" : "personas"} en el equipo.`}
          flush
        >
          {loading ? (
            <Skeleton variant="table-row" count={5} />
          ) : rows.length === 0 ? (
            <p className="page-empty" style={{ margin: 0 }}>
              Todavía no hay usuarios cargados.
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acceso</th>
                    <th style={{ width: "1%" }} aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className={!row.enabled ? "is-disabled" : undefined}>
                      <td>
                        <strong style={{ fontWeight: 600 }}>{row.name}</strong>
                      </td>
                      <td className="cell-muted">{row.email}</td>
                      <td>
                        <select
                          className="select"
                          value={row.role}
                          onChange={(e) => handleRoleChange(row, e.target.value as MemberRole)}
                          aria-label={`Rol de ${row.name}`}
                        >
                          <option value="agent">{roleLabel.agent}</option>
                          <option value="admin">{roleLabel.admin}</option>
                        </select>
                      </td>
                      <td>
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            checked={row.enabled}
                            disabled={row.id === member.id}
                            title={row.id === member.id ? "No podés deshabilitarte a vos mismo" : undefined}
                            onChange={(e) => handleEnabledChange(row, e.target.checked)}
                          />
                          <span>{row.enabled ? "Habilitado" : "Deshabilitado"}</span>
                        </label>
                      </td>
                      <td>
                        <Button
                          type="button"
                          variant="danger-ghost"
                          size="sm"
                          disabled={row.id === member.id}
                          title={row.id === member.id ? "No podés eliminarte" : undefined}
                          onClick={() => requestDelete(row)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SurfaceCard>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={pendingDeleteRow ? `¿Eliminar a ${pendingDeleteRow.name} (${pendingDeleteRow.email})?` : ""}
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
