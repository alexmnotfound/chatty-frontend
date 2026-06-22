import { toast } from "../lib/toast";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { superAdmin, type SuperDashboard } from "../api";
import { PageHeader, SurfaceCard, Skeleton } from "../components/ui";
import { Building2, Users, MessageSquare, Mail } from "lucide-react";

function StatChip({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="account-stat">
      <div className="account-stat__label">
        <Icon size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
        {label}
      </div>
      <div className="account-stat__value">{value}</div>
    </div>
  );
}

export default function SuperDashboard() {
  const [data, setData] = useState<SuperDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdmin.dashboard.get()
      .then(setData)
      .catch(() => toast("Error al cargar el dashboard", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Dashboard" subtitle="Resumen de la plataforma." />
      <div className="page-body">
        {loading ? (
          <Skeleton variant="card" count={3} />
        ) : !data ? null : (
          <>
            <SurfaceCard accent eyebrow="Plataforma" title="Métricas globales">
              <div className="account-strip">
                <StatChip label="Empresas activas" value={data.companiesActive} icon={Building2} />
                <StatChip label="Usuarios totales" value={data.usersTotal} icon={Users} />
                <StatChip label="Conversaciones hoy" value={data.conversationsToday} icon={MessageSquare} />
                <StatChip label="Mensajes hoy" value={data.messagesToday} icon={Mail} />
              </div>
            </SurfaceCard>

            <SurfaceCard eyebrow="Empresas" title="Últimas registradas" flush>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Empresa</th><th>Estado</th><th>Creada</th></tr>
                  </thead>
                  <tbody>
                    {data.recentCompanies.map(c => (
                      <tr key={c.id} className={!c.active ? "is-disabled" : undefined}>
                        <td>
                          <Link to={`/super/companies/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                            <strong style={{ fontWeight: 600 }}>{c.name}</strong>
                            <span className="cell-muted" style={{ marginLeft: "0.4rem" }}>{c.slug}</span>
                          </Link>
                        </td>
                        <td>{c.active ? <span className="badge ai">Activa</span> : <span className="badge">Deshabilitada</span>}</td>
                        <td className="cell-muted">{fmtDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>

            <SurfaceCard eyebrow="Actividad" title="Conversaciones recientes" flush>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Empresa</th><th>Contacto</th><th>Hace</th></tr>
                  </thead>
                  <tbody>
                    {data.recentActivity.map(a => (
                      <tr key={a.id}>
                        <td>
                          <Link to={`/super/companies/${a.companyId}`} style={{ color: "inherit", textDecoration: "none" }}>
                            <strong style={{ fontWeight: 600 }}>{a.company}</strong>
                          </Link>
                        </td>
                        <td className="cell-muted">{a.contact}</td>
                        <td className="cell-muted">{timeAgo(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>

            {data.topPlugins.length > 0 && (
              <SurfaceCard eyebrow="Plugins" title="Más usados" flush>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Plugin</th><th>Empresas</th></tr></thead>
                    <tbody>
                      {data.topPlugins.map(p => (
                        <tr key={p.id}>
                          <td>
                            {p.icon && <span style={{ marginRight: "0.4rem" }}>{p.icon}</span>}
                            <strong style={{ fontWeight: 600 }}>{p.name}</strong>
                          </td>
                          <td>{p.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SurfaceCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}
