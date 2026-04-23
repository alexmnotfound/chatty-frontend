import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { superAdmin, type CompanySummary } from "../api";
import { Building2, ChevronRight, Plus } from "lucide-react";
import { SurfaceCard, PageHeader, Button, FormGroup, Skeleton } from "../components/ui";
import { useToast } from "../components/ui/Toast";

export default function SuperCompanies() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", adminEmail: "", adminPassword: "", adminName: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    superAdmin.companies.list()
      .then(setCompanies)
      .catch((e) => toast(e instanceof Error ? e.message : "Error al cargar", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    if (!form.slug.trim()) errs.slug = "El slug es obligatorio";
    if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Solo minusculas, numeros y guiones";
    if (!form.adminEmail) errs.adminEmail = "El email es obligatorio";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) errs.adminEmail = "Email no valido";
    if (!form.adminName.trim()) errs.adminName = "El nombre es obligatorio";
    if (!form.adminPassword) errs.adminPassword = "La contrasena es obligatoria";
    if (form.adminPassword.length < 6) errs.adminPassword = "Minimo 6 caracteres";
    return errs;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setCreating(true);
    try {
      await superAdmin.companies.create(form);
      setShowCreate(false);
      setForm({ name: "", slug: "", adminEmail: "", adminPassword: "", adminName: "" });
      setFormErrors({});
      toast("Empresa creada", "success");
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Error al crear", "error");
    } finally {
      setCreating(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader
        title="Empresas"
        subtitle="Gestiona las empresas de la plataforma."
      />

      <div className="page-body">
        <SurfaceCard
          accent={showCreate}
          eyebrow="Alta"
          title="Nueva empresa"
          description={showCreate ? "Completa los datos para crear una empresa con su administrador inicial." : undefined}
        >
          {!showCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Crear empresa
            </Button>
          ) : (
            <form onSubmit={handleCreate}>
              <div className="form-grid-2">
                <FormGroup label="Nombre de la empresa" error={formErrors.name}>
                  {(props) => (
                    <input
                      {...props}
                      value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormErrors((p) => ({ ...p, name: "" })); }}
                      placeholder="Ej: Mi Empresa SRL"
                      required
                    />
                  )}
                </FormGroup>
                <FormGroup label="Slug (URL)" error={formErrors.slug}>
                  {(props) => (
                    <input
                      {...props}
                      value={form.slug}
                      onChange={(e) => { setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }); setFormErrors((p) => ({ ...p, slug: "" })); }}
                      placeholder="mi-empresa"
                      required
                    />
                  )}
                </FormGroup>
              </div>
              <div className="form-grid-2">
                <FormGroup label="Nombre del admin" error={formErrors.adminName}>
                  {(props) => (
                    <input
                      {...props}
                      value={form.adminName}
                      onChange={(e) => { setForm({ ...form, adminName: e.target.value }); setFormErrors((p) => ({ ...p, adminName: "" })); }}
                      placeholder="Juan Perez"
                      required
                    />
                  )}
                </FormGroup>
                <FormGroup label="Email del admin" error={formErrors.adminEmail}>
                  {(props) => (
                    <input
                      {...props}
                      type="email"
                      value={form.adminEmail}
                      onChange={(e) => { setForm({ ...form, adminEmail: e.target.value }); setFormErrors((p) => ({ ...p, adminEmail: "" })); }}
                      placeholder="admin@empresa.com"
                      required
                    />
                  )}
                </FormGroup>
              </div>
              <FormGroup label="Contrasena del admin" error={formErrors.adminPassword}>
                {(props) => (
                  <input
                    {...props}
                    type="password"
                    value={form.adminPassword}
                    onChange={(e) => { setForm({ ...form, adminPassword: e.target.value }); setFormErrors((p) => ({ ...p, adminPassword: "" })); }}
                    placeholder="Minimo 6 caracteres"
                    required
                    minLength={6}
                    style={{ maxWidth: "380px" }}
                  />
                )}
              </FormGroup>
              <div className="form-actions">
                <Button type="submit" variant="primary" loading={creating}>
                  {creating ? "Creando..." : "Crear empresa"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowCreate(false); setFormErrors({}); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </SurfaceCard>

        <SurfaceCard
          eyebrow="Plataforma"
          title="Empresas registradas"
          description={loading ? "Cargando..." : `${companies.length} ${companies.length === 1 ? "empresa" : "empresas"} en la plataforma.`}
          flush
        >
          {loading ? (
            <Skeleton variant="table-row" count={3} />
          ) : companies.length === 0 ? (
            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>
              No hay empresas todavia. Crea la primera arriba.
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Miembros</th>
                    <th>Conversaciones</th>
                    <th>Estado</th>
                    <th>Creada</th>
                    <th style={{ width: "1%" }} aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr
                      key={c.id}
                      className={!c.enabled ? "is-disabled" : undefined}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <Link
                          to={`/super/companies/${c.id}`}
                          style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "inherit", textDecoration: "none" }}
                        >
                          <Building2 size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
                          <strong style={{ fontWeight: 600 }}>{c.name}</strong>
                          <span className="cell-muted" style={{ fontWeight: 400 }}>{c.slug}</span>
                        </Link>
                      </td>
                      <td>{c.teamMemberCount}</td>
                      <td>{c.conversationCount}</td>
                      <td>
                        {c.enabled ? (
                          <span className="badge ai">Activa</span>
                        ) : (
                          <span className="badge">Deshabilitada</span>
                        )}
                      </td>
                      <td className="cell-muted">{fmtDate(c.createdAt)}</td>
                      <td>
                        <Link to={`/super/companies/${c.id}`} style={{ color: "var(--muted)" }}>
                          <ChevronRight size={16} />
                        </Link>
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
