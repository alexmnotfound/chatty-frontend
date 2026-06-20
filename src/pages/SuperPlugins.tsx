import { useState, useEffect, useCallback } from "react";
import { superAdmin, type Plugin } from "../api";
import { PageHeader, SurfaceCard, Button, FormGroup, Skeleton } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

type PluginForm = { name: string; slug: string; description: string; icon: string; price_usd: string; active: boolean };
const emptyForm: PluginForm = { name: "", slug: "", description: "", icon: "", price_usd: "0", active: true };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function SuperPlugins() {
  const { toast } = useToast();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PluginForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    superAdmin.plugins.list()
      .then(setPlugins)
      .catch(() => toast("Error al cargar plugins", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (p: Plugin) => {
    setEditingId(p.id);
    setForm({ name: p.name, slug: p.slug, description: p.description ?? "", icon: p.icon ?? "", price_usd: String(p.price_usd), active: p.active });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name.trim(), slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined,
      price_usd: parseFloat(form.price_usd) || 0,
      active: form.active,
    };
    setSaving(true);
    try {
      if (editingId) {
        await superAdmin.plugins.update(editingId, data);
        toast("Plugin actualizado", "success");
      } else {
        await superAdmin.plugins.create(data);
        toast("Plugin creado", "success");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plugin? Se revocarán las asignaciones existentes.")) return;
    try {
      await superAdmin.plugins.delete(id);
      toast("Plugin eliminado", "success");
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Error al eliminar", "error");
    }
  };

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Plugins" subtitle="Catálogo de integraciones disponibles." />
      <div className="page-body">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <Button size="sm" onClick={openCreate}><Plus size={14} /> Nuevo plugin</Button>
        </div>

        {showForm && (
          <SurfaceCard accent eyebrow={editingId ? "Editar" : "Nuevo"} title={editingId ? "Editar plugin" : "Crear plugin"}>
            <form onSubmit={handleSave}>
              <FormGroup label="Nombre">
                {(props) => (
                  <input
                    {...props}
                    className="form-input" value={form.name} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))}
                  />
                )}
              </FormGroup>
              <FormGroup label="Slug">
                {(props) => (
                  <input {...props} className="form-input" value={form.slug} required onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
                )}
              </FormGroup>
              <FormGroup label="Descripción">
                {(props) => (
                  <input {...props} className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                )}
              </FormGroup>
              <FormGroup label="Icono (emoji o URL)">
                {(props) => (
                  <input {...props} className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                )}
              </FormGroup>
              <FormGroup label="Precio (USD/mes)">
                {(props) => (
                  <input {...props} className="form-input" type="number" min="0" step="0.01" value={form.price_usd} onChange={e => setForm(f => ({ ...f, price_usd: e.target.value }))} />
                )}
              </FormGroup>
              <FormGroup label="Activo">
                {() => (
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    Visible para asignación
                  </label>
                )}
              </FormGroup>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="submit" disabled={saving}>{saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}</Button>
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </SurfaceCard>
        )}

        <SurfaceCard eyebrow="Catálogo" title="Plugins registrados" flush>
          {loading ? (
            <Skeleton variant="table-row" count={3} />
          ) : plugins.length === 0 ? (
            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>No hay plugins todavía.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Plugin</th><th>Precio</th><th>Empresas</th><th>Estado</th><th style={{ width: "1%" }} /></tr>
                </thead>
                <tbody>
                  {plugins.map(p => (
                    <tr key={p.id} className={!p.active ? "is-disabled" : undefined}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {p.icon && <span style={{ fontSize: "1.1rem" }}>{p.icon}</span>}
                          <div>
                            <strong style={{ fontWeight: 600 }}>{p.name}</strong>
                            {p.description && <div className="cell-muted" style={{ fontSize: "0.8rem" }}>{p.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td>${p.price_usd.toFixed(2)}/mes</td>
                      <td>{p.companiesCount}</td>
                      <td>{p.active ? <span className="badge ai">Activo</span> : <span className="badge">Inactivo</span>}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0.25rem" }} title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger, #ef4444)", padding: "0.25rem" }} title="Eliminar">
                            <Trash2 size={14} />
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
