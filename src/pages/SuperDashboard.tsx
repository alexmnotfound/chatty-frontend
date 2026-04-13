import { useState, useEffect, type FormEvent } from "react";
import { superAdmin, type CompanySummary } from "../api";
import { useSuperAuth } from "../SuperAuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, LogOut, Check, X } from "lucide-react";
import { SurfaceCard, PageHeader, Button } from "../components/ui";

export default function SuperDashboard() {
  const { admin, logout } = useSuperAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", adminEmail: "", adminPassword: "", adminName: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    superAdmin.companies.list()
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await superAdmin.companies.create(form);
      setShowCreate(false);
      setForm({ name: "", slug: "", adminEmail: "", adminPassword: "", adminName: "" });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await superAdmin.companies.update(id, { enabled: !enabled });
    load();
  };

  const handleLogout = () => { logout(); navigate("/super/login"); };

  if (loading) return <div className="page-loading">Cargando...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <PageHeader title="Empresas" subtitle={`Hola, ${admin?.name}`} />
        <Button variant="ghost" onClick={handleLogout}><LogOut size={16} /> Salir</Button>
      </div>

      <Button onClick={() => setShowCreate(!showCreate)} style={{ marginBottom: "1rem" }}>
        <Plus size={16} /> Nueva empresa
      </Button>

      {showCreate && (
        <div style={{ marginBottom: "1rem" }}>
        <SurfaceCard>
          <form onSubmit={handleCreate}>
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
              <label>Nombre de la empresa</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Slug (URL-friendly, solo minúsculas y guiones)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} required />
            </div>
            <div className="form-group">
              <label>Email del admin</label>
              <input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Nombre del admin</label>
              <input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Contraseña del admin (mín. 6)</label>
              <input type="password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} required minLength={6} />
            </div>
            <div className="form-actions">
              <Button type="submit" loading={creating}>{creating ? "Creando..." : "Crear empresa"}</Button>
            </div>
          </form>
        </SurfaceCard>
        </div>
      )}

      {companies.length === 0 ? (
        <SurfaceCard><p>No hay empresas todavía.</p></SurfaceCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {companies.map((c) => (
            <SurfaceCard key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Building2 size={18} />
                    <strong>{c.name}</strong>
                    <span style={{ opacity: 0.5 }}>({c.slug})</span>
                    {!c.enabled && <span className="badge badge-danger">Deshabilitada</span>}
                  </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "0.25rem" }}>
                    {c.teamMemberCount} miembros · {c.conversationCount} conversaciones
                    {c.whatsappPhoneNumberId && ` · WA: ${c.whatsappPhoneNumberId}`}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleEnabled(c.id, c.enabled)}>
                  {c.enabled ? <X size={14} /> : <Check size={14} />}
                  {c.enabled ? " Deshabilitar" : " Habilitar"}
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  );
}
