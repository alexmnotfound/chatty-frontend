import { toast } from "../lib/toast";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  superAdmin, type CompanyDetail, type SuperCompanyTeamMember,
  type CompanyPlugin, type CompanyBilling, type Plugin,
} from "../api";
import { Users, MessageSquare, Bot, ListChecks, Phone, Key, Check, X, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { SurfaceCard, PageHeader, Button, FormGroup, Skeleton, ConfirmDialog } from "../components/ui";

type Tab = "info" | "miembros" | "plugins" | "billing";

function CredentialChip({ label, configured, icon: Icon }: { label: string; configured: boolean; icon: React.ElementType }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      fontSize: "0.78rem", fontWeight: 500, padding: "0.2rem 0.55rem", borderRadius: "999px", border: "1px solid",
      borderColor: configured ? "rgba(37, 211, 102, 0.5)" : "var(--border-subtle)",
      background: configured ? "rgba(37, 211, 102, 0.3)" : "var(--border-subtle)",
    }}>
      <Icon size={12} />{label}{configured ? <Check size={11} /> : <X size={11} />}
    </span>
  );
}

export default function SuperCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("info");

  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmToggle, setConfirmToggle] = useState(false);

  const [teamMembers, setTeamMembers] = useState<SuperCompanyTeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: "", name: "", password: "", role: "agent" as "admin" | "agent", createNew: true });
  const [addingMember, setAddingMember] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<string | null>(null);

  const [companyPlugins, setCompanyPlugins] = useState<CompanyPlugin[]>([]);
  const [allPlugins, setAllPlugins] = useState<Plugin[]>([]);
  const [loadingPlugins, setLoadingPlugins] = useState(true);
  const [showAssignPlugin, setShowAssignPlugin] = useState(false);
  const [selectedPluginId, setSelectedPluginId] = useState("");
  const [assigningPlugin, setAssigningPlugin] = useState(false);

  const [billing, setBilling] = useState<CompanyBilling | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [billingForm, setBillingForm] = useState({ plan: "free" as "free" | "starter" | "pro" | "custom", internal_notes: "" });
  const [savingBilling, setSavingBilling] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    try { setDetail(await superAdmin.companies.get(id)); }
    catch (e) { toast(e instanceof Error ? e.message : "Error al cargar", "error"); navigate("/super/companies"); }
    finally { setLoading(false); }
  }, [id, toast, navigate]);

  const loadTeam = useCallback(async () => {
    if (!id) return;
    try { setTeamMembers(await superAdmin.companies.getTeam(id)); }
    catch { toast("Error al cargar equipo", "error"); }
    finally { setLoadingTeam(false); }
  }, [id, toast]);

  const loadPlugins = useCallback(async () => {
    if (!id) return;
    try {
      const [assigned, catalog] = await Promise.all([superAdmin.companies.getPlugins(id), superAdmin.plugins.list()]);
      setCompanyPlugins(assigned);
      setAllPlugins(catalog.filter(p => p.active));
    } catch { toast("Error al cargar plugins", "error"); }
    finally { setLoadingPlugins(false); }
  }, [id, toast]);

  const loadBilling = useCallback(async () => {
    if (!id) return;
    try {
      const b = await superAdmin.companies.getBilling(id);
      setBilling(b);
      setBillingForm({ plan: b.plan, internal_notes: b.internal_notes });
    } catch { toast("Error al cargar billing", "error"); }
    finally { setLoadingBilling(false); }
  }, [id, toast]);

  useEffect(() => { loadDetail(); loadTeam(); loadPlugins(); loadBilling(); }, [loadDetail, loadTeam, loadPlugins, loadBilling]);

  const handleToggleEnabled = async () => {
    if (!detail || !id) return;
    setConfirmToggle(false);
    try {
      await superAdmin.companies.update(id, { active: !detail.active });
      toast(detail.active ? "Empresa deshabilitada" : "Empresa habilitada", "success");
      loadDetail();
    } catch (e) { toast(e instanceof Error ? e.message : "Error", "error"); }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setAddingMember(true);
    try {
      await superAdmin.companies.addMember(id, {
        email: memberForm.email, name: memberForm.name, role: memberForm.role,
        ...(memberForm.createNew ? { password: memberForm.password } : {}),
      });
      toast("Miembro agregado", "success");
      setShowAddMember(false);
      setMemberForm({ email: "", name: "", password: "", role: "agent", createNew: true });
      loadTeam();
    } catch (err) { toast(err instanceof Error ? err.message : "Error al agregar miembro", "error"); }
    finally { setAddingMember(false); }
  };

  const handleChangeMemberRole = async (memberId: string, role: "admin" | "agent") => {
    if (!id) return;
    try {
      await superAdmin.companies.updateMember(id, memberId, { role });
      setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
      toast("Rol actualizado", "success");
    } catch { toast("Error al cambiar rol", "error"); }
  };

  const handleToggleMemberEnabled = async (member: SuperCompanyTeamMember) => {
    if (!id) return;
    try {
      await superAdmin.companies.updateMember(id, member.id, { enabled: !member.enabled });
      setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, enabled: !m.enabled } : m));
      toast(member.enabled ? "Miembro deshabilitado" : "Miembro habilitado", "success");
    } catch { toast("Error al actualizar miembro", "error"); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;
    setConfirmRemoveMember(null);
    try {
      await superAdmin.companies.removeMember(id, memberId);
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      toast("Miembro removido", "success");
    } catch { toast("Error al remover miembro", "error"); }
  };

  const handleAssignPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedPluginId) return;
    setAssigningPlugin(true);
    try {
      await superAdmin.companies.assignPlugin(id, selectedPluginId);
      toast("Plugin asignado", "success");
      setShowAssignPlugin(false); setSelectedPluginId("");
      loadPlugins(); loadBilling();
    } catch (err) { toast(err instanceof Error ? err.message : "Error al asignar plugin", "error"); }
    finally { setAssigningPlugin(false); }
  };

  const handleRevokePlugin = async (companyPluginId: string) => {
    if (!id) return;
    try {
      await superAdmin.companies.revokePlugin(id, companyPluginId);
      setCompanyPlugins(prev => prev.filter(p => p.id !== companyPluginId));
      toast("Plugin revocado", "success"); loadBilling();
    } catch { toast("Error al revocar plugin", "error"); }
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingBilling(true);
    try {
      await superAdmin.companies.updateBilling(id, billingForm);
      toast("Billing actualizado", "success"); loadBilling();
    } catch { toast("Error al guardar billing", "error"); }
    finally { setSavingBilling(false); }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

  const availablePlugins = allPlugins.filter(p => !companyPlugins.some(cp => cp.pluginId === p.id));

  if (loading) return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <div className="page-body"><Skeleton variant="card" count={3} /></div>
    </div>
  );
  if (!detail) return null;

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "0.5rem 1rem", border: "none", background: "none", cursor: "pointer",
    borderBottom: `2px solid ${tab === t ? "var(--brand, #2563eb)" : "transparent"}`,
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? "var(--brand, #2563eb)" : "var(--muted)",
    fontSize: "0.9rem",
  });

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title={detail.name} subtitle={detail.slug} />
      <div className="page-body">
        <div style={{ marginBottom: "1rem" }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/super/companies")}>
            <ArrowLeft size={14} /> Volver a empresas
          </Button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
          {(["info", "miembros", "plugins", "billing"] as Tab[]).map(t => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "info" && (
          <>
            <SurfaceCard accent eyebrow="Datos" title="Resumen de la empresa">
              <div className="account-strip">
                <div className="account-stat">
                  <div className="account-stat__label"><Users size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Miembros</div>
                  <div className="account-stat__value">{detail.teamMemberCount}</div>
                </div>
                <div className="account-stat">
                  <div className="account-stat__label"><MessageSquare size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Conversaciones</div>
                  <div className="account-stat__value">{detail.conversationCount}</div>
                </div>
                <div className="account-stat">
                  <div className="account-stat__label"><Bot size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Roles IA</div>
                  <div className="account-stat__value">{detail.aiRoleCount}</div>
                </div>
                <div className="account-stat">
                  <div className="account-stat__label"><ListChecks size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Tareas</div>
                  <div className="account-stat__value">{detail.taskCount}</div>
                </div>
                <div className="account-stat">
                  <div className="account-stat__label">Creada</div>
                  <div className="account-stat__value">{fmtDate(detail.createdAt)}</div>
                </div>
                <div className="account-stat">
                  <div className="account-stat__label">Estado</div>
                  <div className="account-stat__value">
                    {detail.active ? <span className="badge ai">Activa</span> : <span className="badge">Deshabilitada</span>}
                  </div>
                </div>
              </div>
            </SurfaceCard>
            <SurfaceCard eyebrow="Integraciones" title="Credenciales" description="Estado de las credenciales configuradas por la empresa.">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <CredentialChip label="WhatsApp Phone" configured={!!detail.whatsappPhoneNumberId} icon={Phone} />
                <CredentialChip label="WA Token" configured={detail.hasWhatsAppAccessToken} icon={Key} />
                <CredentialChip label="WA App Secret" configured={detail.hasWhatsAppAppSecret} icon={Key} />
                <CredentialChip label="OpenAI Key" configured={detail.hasOpenAiApiKey} icon={Key} />
              </div>
            </SurfaceCard>
            <SurfaceCard
              eyebrow="Acciones"
              title={detail.active ? "Deshabilitar empresa" : "Habilitar empresa"}
              description={detail.active ? "Los miembros no podran iniciar sesion ni recibir mensajes." : "Los miembros podran volver a usar la plataforma."}
            >
              <Button variant={detail.active ? "danger-ghost" : "primary"} onClick={() => setConfirmToggle(true)}>
                {detail.active ? <><X size={14} /> Deshabilitar</> : <><Check size={14} /> Habilitar</>}
              </Button>
            </SurfaceCard>
          </>
        )}

        {tab === "miembros" && (
          <>
            {showAddMember && (
              <SurfaceCard accent eyebrow="Agregar" title="Nuevo miembro">
                <form onSubmit={handleAddMember}>
                  <FormGroup label="Modo">
                    {() => (
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <label style={{ cursor: "pointer" }}>
                          <input type="radio" checked={memberForm.createNew} onChange={() => setMemberForm(f => ({ ...f, createNew: true }))} />{" "}Crear usuario nuevo
                        </label>
                        <label style={{ cursor: "pointer" }}>
                          <input type="radio" checked={!memberForm.createNew} onChange={() => setMemberForm(f => ({ ...f, createNew: false }))} />{" "}Asignar existente (por email)
                        </label>
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup label="Email">
                    {(props) => <input {...props} className="form-input" type="email" value={memberForm.email} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))} required />}
                  </FormGroup>
                  {memberForm.createNew && (
                    <>
                      <FormGroup label="Nombre">
                        {(props) => <input {...props} className="form-input" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} required />}
                      </FormGroup>
                      <FormGroup label="Contraseña">
                        {(props) => <input {...props} className="form-input" type="password" autoComplete="new-password" value={memberForm.password} onChange={e => setMemberForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />}
                      </FormGroup>
                    </>
                  )}
                  <FormGroup label="Rol">
                    {(props) => (
                      <select {...props} className="form-input" value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value as "admin" | "agent" }))}>
                        <option value="agent">Agente</option>
                        <option value="admin">Administrador</option>
                      </select>
                    )}
                  </FormGroup>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <Button type="submit" disabled={addingMember}>{addingMember ? "Agregando..." : "Agregar"}</Button>
                    <Button variant="ghost" type="button" onClick={() => setShowAddMember(false)}>Cancelar</Button>
                  </div>
                </form>
              </SurfaceCard>
            )}
            <SurfaceCard eyebrow="Equipo" title={`Miembros (${teamMembers.length})`} flush>
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "0.75rem 1rem 0" }}>
                {!showAddMember && <Button size="sm" onClick={() => setShowAddMember(true)}><Plus size={14} /> Agregar</Button>}
              </div>
              {loadingTeam ? (
                <Skeleton variant="table-row" count={3} />
              ) : teamMembers.length === 0 ? (
                <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>Sin miembros.</p>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th style={{ width: "1%" }} /></tr></thead>
                    <tbody>
                      {teamMembers.map(m => (
                        <tr key={m.id} className={!m.enabled ? "is-disabled" : undefined}>
                          <td><strong style={{ fontWeight: 600 }}>{m.name}</strong></td>
                          <td className="cell-muted">{m.email}</td>
                          <td>
                            <select className="form-input" style={{ padding: "0.2rem 0.4rem", fontSize: "0.85rem" }} value={m.role} onChange={e => handleChangeMemberRole(m.id, e.target.value as "admin" | "agent")}>
                              <option value="agent">Agente</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </td>
                          <td>
                            <button onClick={() => handleToggleMemberEnabled(m)} style={{ fontSize: "0.8rem", background: "none", border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer" }}>
                              {m.enabled ? "Deshabilitar" : "Habilitar"}
                            </button>
                          </td>
                          <td>
                            <button onClick={() => setConfirmRemoveMember(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger, #ef4444)", padding: "0.25rem" }} title="Remover">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SurfaceCard>
          </>
        )}

        {tab === "plugins" && (
          <>
            {showAssignPlugin && (
              <SurfaceCard accent eyebrow="Asignar" title="Agregar plugin">
                <form onSubmit={handleAssignPlugin}>
                  <FormGroup label="Plugin">
                    {(props) => (
                      <select {...props} className="form-input" value={selectedPluginId} onChange={e => setSelectedPluginId(e.target.value)} required>
                        <option value="">Seleccionar plugin...</option>
                        {availablePlugins.map(p => (
                          <option key={p.id} value={p.id}>{p.icon ? `${p.icon} ` : ""}{p.name} — ${p.price_usd.toFixed(2)}/mes</option>
                        ))}
                      </select>
                    )}
                  </FormGroup>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <Button type="submit" disabled={assigningPlugin || !selectedPluginId}>{assigningPlugin ? "Asignando..." : "Asignar"}</Button>
                    <Button variant="ghost" type="button" onClick={() => { setShowAssignPlugin(false); setSelectedPluginId(""); }}>Cancelar</Button>
                  </div>
                </form>
              </SurfaceCard>
            )}
            <SurfaceCard eyebrow="Plugins" title={`Plugins asignados (${companyPlugins.length})`} flush>
              {availablePlugins.length > 0 && !showAssignPlugin && (
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "0.75rem 1rem 0" }}>
                  <Button size="sm" onClick={() => setShowAssignPlugin(true)}><Plus size={14} /> Agregar plugin</Button>
                </div>
              )}
              {loadingPlugins ? (
                <Skeleton variant="table-row" count={2} />
              ) : companyPlugins.length === 0 ? (
                <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>Sin plugins asignados.</p>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Plugin</th><th>Precio</th><th>Asignado</th><th style={{ width: "1%" }} /></tr></thead>
                    <tbody>
                      {companyPlugins.map(p => (
                        <tr key={p.id}>
                          <td>{p.icon && <span style={{ marginRight: "0.4rem" }}>{p.icon}</span>}<strong style={{ fontWeight: 600 }}>{p.name}</strong></td>
                          <td>${p.price_usd.toFixed(2)}/mes</td>
                          <td className="cell-muted">{fmtDate(p.assignedAt)}</td>
                          <td>
                            <button onClick={() => handleRevokePlugin(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger, #ef4444)", padding: "0.25rem" }} title="Revocar">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SurfaceCard>
          </>
        )}

        {tab === "billing" && (
          <>
            <SurfaceCard accent eyebrow="Plan" title="Plan y facturación">
              {loadingBilling ? <Skeleton variant="card" count={1} /> : (
                <form onSubmit={handleSaveBilling}>
                  <FormGroup label="Plan">
                    {(props) => (
                      <select {...props} className="form-input" value={billingForm.plan} onChange={e => setBillingForm(f => ({ ...f, plan: e.target.value as "free" | "starter" | "pro" | "custom" }))}>
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="custom">Custom</option>
                      </select>
                    )}
                  </FormGroup>
                  <FormGroup label="Notas internas">
                    {(props) => (
                      <textarea {...props} className="form-input" rows={4} value={billingForm.internal_notes}
                        onChange={e => setBillingForm(f => ({ ...f, internal_notes: e.target.value }))}
                        placeholder="Notas visibles solo en super admin..." style={{ resize: "vertical" }}
                      />
                    )}
                  </FormGroup>
                  <Button type="submit" disabled={savingBilling}>{savingBilling ? "Guardando..." : "Guardar"}</Button>
                </form>
              )}
            </SurfaceCard>
            {billing && (
              <SurfaceCard eyebrow="Resumen" title={`Total mensual: $${billing.monthlyTotal.toFixed(2)}`} flush>
                {billing.plugins.length === 0 ? (
                  <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>Sin plugins asignados.</p>
                ) : (
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Plugin</th><th>Precio/mes</th></tr></thead>
                      <tbody>
                        {billing.plugins.map(p => (
                          <tr key={p.id}>
                            <td>{p.icon && <span style={{ marginRight: "0.4rem" }}>{p.icon}</span>}<strong style={{ fontWeight: 600 }}>{p.name}</strong></td>
                            <td>${p.price_usd.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SurfaceCard>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmToggle}
        title={detail.active ? `Deshabilitar ${detail.name}?` : `Habilitar ${detail.name}?`}
        description={detail.active ? "Los miembros no podran iniciar sesion ni recibir mensajes." : "Los miembros podran volver a usar la plataforma."}
        confirmLabel={detail.active ? "Deshabilitar" : "Habilitar"}
        cancelLabel="Cancelar"
        variant={detail.active ? "danger" : undefined}
        onConfirm={handleToggleEnabled}
        onCancel={() => setConfirmToggle(false)}
      />
      <ConfirmDialog
        open={!!confirmRemoveMember}
        title="Remover miembro?"
        description="El usuario perderá acceso a esta empresa."
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => confirmRemoveMember && handleRemoveMember(confirmRemoveMember)}
        onCancel={() => setConfirmRemoveMember(null)}
      />
    </div>
  );
}
