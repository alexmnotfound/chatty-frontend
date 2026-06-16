import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { superAdmin, type CompanyDetail, type SuperCompanyTeamMember, type SuperCompanyBot } from "../api";
import { Users, MessageSquare, Bot, ListChecks, Phone, Key, Check, X, ArrowLeft } from "lucide-react";
import { SurfaceCard, PageHeader, Button, Skeleton, ConfirmDialog } from "../components/ui";
import { useToast } from "../components/ui/Toast";

function CredentialChip({ label, configured, icon: Icon }: { label: string; configured: boolean; icon: typeof Check }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.25rem 0.6rem",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.78rem",
        fontWeight: 500,
        background: configured ? "rgba(37, 211, 102, 0.1)" : "var(--surface-hover)",
        color: configured ? "var(--success, #128c7e)" : "var(--muted)",
        border: `1px solid ${configured ? "rgba(37, 211, 102, 0.3)" : "var(--border-subtle)"}`,
      }}
    >
      <Icon size={12} />
      {label}
      {configured ? <Check size={11} /> : <X size={11} />}
    </span>
  );
}

export default function SuperCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [teamMembers, setTeamMembers] = useState<SuperCompanyTeamMember[]>([]);
  const [bots, setBots] = useState<SuperCompanyBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingBots, setLoadingBots] = useState(true);
  const [confirmToggle, setConfirmToggle] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    try {
      const d = await superAdmin.companies.get(id);
      setDetail(d);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al cargar", "error");
      navigate("/super/companies");
    } finally {
      setLoading(false);
    }
  }, [id, toast, navigate]);

  const loadTeam = useCallback(async () => {
    if (!id) return;
    try {
      const members = await superAdmin.companies.getTeam(id);
      setTeamMembers(members);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al cargar equipo", "error");
    } finally {
      setLoadingTeam(false);
    }
  }, [id, toast]);

  const loadBots = useCallback(async () => {
    if (!id) return;
    try {
      const data = await superAdmin.companies.getBots(id);
      setBots(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al cargar bots", "error");
    } finally {
      setLoadingBots(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadDetail();
    loadTeam();
    loadBots();
  }, [loadDetail, loadTeam, loadBots]);

  const handleToggleBotActive = async (botId: string, active: boolean) => {
    if (!id) return;
    try {
      await superAdmin.companies.toggleBotActive(id, botId, active);
      setBots(prev => prev.map(b => b.id === botId ? { ...b, active } : b));
      toast(active ? "Bot activado" : "Bot desactivado", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error", "error");
    }
  };

  const handleToggleEnabled = async () => {
    if (!detail || !id) return;
    setConfirmToggle(false);
    try {
      await superAdmin.companies.update(id, { active: !detail.active });
      toast(detail.active ? "Empresa deshabilitada" : "Empresa habilitada", "success");
      loadDetail();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error", "error");
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="panel" style={{ flex: 1, overflow: "auto" }}>
        <div className="page-body">
          <Skeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader
        title={detail.name}
        subtitle={detail.slug}
      />

      <div className="page-body">
        <div style={{ marginBottom: "1rem" }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/super/companies")}>
            <ArrowLeft size={14} /> Volver a empresas
          </Button>
        </div>

        <SurfaceCard
          accent
          eyebrow="Datos"
          title="Resumen de la empresa"
        >
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
                {detail.active ? (
                  <span className="badge ai">Activa</span>
                ) : (
                  <span className="badge">Deshabilitada</span>
                )}
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Integraciones"
          title="Credenciales"
          description="Estado de las credenciales configuradas por la empresa."
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <CredentialChip label="WhatsApp Phone" configured={!!detail.whatsappPhoneNumberId} icon={Phone} />
            <CredentialChip label="WA Token" configured={detail.hasWhatsAppAccessToken} icon={Key} />
            <CredentialChip label="WA App Secret" configured={detail.hasWhatsAppAppSecret} icon={Key} />
            <CredentialChip label="OpenAI Key" configured={detail.hasOpenAiApiKey} icon={Bot} />
          </div>
          {detail.whatsappPhoneNumberId && (
            <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
              Phone Number ID: <code style={{ fontSize: "0.8rem" }}>{detail.whatsappPhoneNumberId}</code>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Equipo"
          title="Miembros"
          description={loadingTeam ? "Cargando..." : `${teamMembers.length} ${teamMembers.length === 1 ? "persona" : "personas"} en el equipo.`}
          flush
        >
          {loadingTeam ? (
            <Skeleton variant="table-row" count={3} />
          ) : teamMembers.length === 0 ? (
            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>
              Esta empresa no tiene miembros.
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((m) => (
                    <tr key={m.id} className={!m.enabled ? "is-disabled" : undefined}>
                      <td><strong style={{ fontWeight: 600 }}>{m.name}</strong></td>
                      <td className="cell-muted">{m.email}</td>
                      <td>{m.role === "admin" ? "Administrador" : "Agente"}</td>
                      <td>
                        {m.enabled ? (
                          <span className="badge ai">Activo</span>
                        ) : (
                          <span className="badge">Deshabilitado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Bots"
          title="Bots"
          description={loadingBots ? "Cargando..." : `${bots.length} ${bots.length === 1 ? "bot" : "bots"} configurados.`}
          flush
        >
          {loadingBots ? (
            <Skeleton variant="table-row" count={2} />
          ) : bots.length === 0 ? (
            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>
              Esta empresa no tiene bots.
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Proveedor IA</th>
                    <th>Modelo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((bot) => (
                    <tr key={bot.id} className={!bot.active ? "is-disabled" : undefined}>
                      <td><strong style={{ fontWeight: 600 }}>{bot.name}</strong></td>
                      <td className="cell-muted">{bot.aiProvider ?? "—"}</td>
                      <td className="cell-muted">{bot.aiModel ?? "—"}</td>
                      <td>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem" }}>
                          <input
                            type="checkbox"
                            checked={bot.active}
                            onChange={(e) => handleToggleBotActive(bot.id, e.target.checked)}
                          />
                          {bot.active ? <span className="badge ai">Activo</span> : <span className="badge">Inactivo</span>}
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Acciones"
          title={detail.active ? "Deshabilitar empresa" : "Habilitar empresa"}
          description={detail.active
            ? "Los miembros no podran iniciar sesion ni recibir mensajes."
            : "Los miembros podran volver a usar la plataforma."
          }
        >
          <Button
            variant={detail.active ? "danger-ghost" : "primary"}
            onClick={() => setConfirmToggle(true)}
          >
            {detail.active ? <><X size={14} /> Deshabilitar</> : <><Check size={14} /> Habilitar</>}
          </Button>
        </SurfaceCard>
      </div>

      <ConfirmDialog
        open={confirmToggle}
        title={detail.active ? `Deshabilitar ${detail.name}?` : `Habilitar ${detail.name}?`}
        description={detail.active
          ? "Los miembros de esta empresa no podran iniciar sesion ni recibir mensajes."
          : "Los miembros de esta empresa podran volver a usar la plataforma."
        }
        confirmLabel={detail.active ? "Deshabilitar" : "Habilitar"}
        cancelLabel="Cancelar"
        variant={detail.active ? "danger" : undefined}
        onConfirm={handleToggleEnabled}
        onCancel={() => setConfirmToggle(false)}
      />
    </div>
  );
}
