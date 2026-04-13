import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { aiRoles, type AiRole, type AiRoleExample } from "../api";
import { useAuth } from "../AuthContext";
import { FormGroup } from "../components/ui";
import { useToast } from "../components/ui/Toast";

export default function Bots() {
  const { member } = useAuth();
  const [roles, setRoles] = useState<AiRole[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError("");
    return aiRoles
      .list()
      .then((list) => {
        setRoles(list);
        setActiveId((prev) => {
          if (prev && list.some((r) => r.id === prev)) return prev;
          return list[0]?.id ?? null;
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  if (member?.role !== "admin") {
    return <Navigate to="/inbox" replace />;
  }

  const save = async (id: string, name: string, systemPrompt: string) => {
    setError("");
    setSavingId(id);
    try {
      const updated = await aiRoles.update(id, { name: name.trim(), systemPrompt: systemPrompt.trim() });
      setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingId(null);
    }
  };

  const activeRole = roles.find((r) => r.id === activeId) ?? roles[0] ?? null;

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto" }}>
      <div className="panel-toolbar panel-toolbar--page">
        <div className="panel-toolbar-text">
          <strong>Reglas de bots</strong>
          <p className="panel-toolbar-sub">
            Definí la personalidad y límites de cada asistente. Solo aplica cuando la conversación está en modo IA.
          </p>
        </div>
      </div>

      <div className="page-body bots-page-body">
        {error && <div className="page-alert">{error}</div>}

        {loading ? (
          <p className="page-empty">Cargando roles…</p>
        ) : roles.length === 0 ? (
          <p className="page-empty">No hay roles de IA configurados.</p>
        ) : (
          <>
            <div className="bot-pills" role="tablist" aria-label="Elegir bot">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={r.id === activeRole?.id}
                  className="bot-pill"
                  onClick={() => setActiveId(r.id)}
                >
                  {r.name}
                </button>
              ))}
            </div>

            {activeRole && (
              <RoleEditor key={activeRole.id} role={activeRole} saving={savingId === activeRole.id} onSave={save} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RoleEditor({
  role,
  saving,
  onSave,
}: {
  role: AiRole;
  saving: boolean;
  onSave: (id: string, name: string, systemPrompt: string) => void;
}) {
  const [name, setName] = useState(role.name);
  const [systemPrompt, setSystemPrompt] = useState(role.systemPrompt ?? "");
  const [examples, setExamples] = useState<AiRoleExample[]>(role.examples ?? []);
  const [newExampleTitle, setNewExampleTitle] = useState("");
  const [newExampleContent, setNewExampleContent] = useState("");
  const [isCreatingExample, setIsCreatingExample] = useState(false);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [savingExample, setSavingExample] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [knowledgeFiles, setKnowledgeFiles] = useState(role.knowledgeFiles ?? []);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    setName(role.name);
    setSystemPrompt(role.systemPrompt ?? "");
    setExamples(role.examples ?? []);
    setSelectedExampleId((role.examples ?? [])[0]?.id ?? null);
    setKnowledgeFiles(role.knowledgeFiles ?? []);
    setNewExampleTitle("");
    setNewExampleContent("");
    setIsCreatingExample(false);
    setFieldErrors({});
  }, [role.id, role.name, role.systemPrompt, role.examples, role.knowledgeFiles]);

  const dirty = name !== role.name || systemPrompt !== (role.systemPrompt ?? "");
  const maxExamplesReached = examples.length >= 3;
  const selectedExample = examples.find((ex) => ex.id === selectedExampleId) ?? null;
  const addExample = async () => {
    if (!newExampleTitle.trim() || !newExampleContent.trim() || maxExamplesReached) return;
    setSavingExample("new");
    try {
      const created = await aiRoles.addExample(role.id, {
        title: newExampleTitle.trim(),
        content: newExampleContent.trim(),
      });
      setExamples((prev) => [...prev, created]);
      setSelectedExampleId(created.id);
      setNewExampleTitle("");
      setNewExampleContent("");
      setIsCreatingExample(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al crear ejemplo", "error");
    } finally {
      setSavingExample(null);
    }
  };

  const saveExample = async (exampleId: string, title: string, content: string) => {
    setSavingExample(exampleId);
    try {
      const updated = await aiRoles.updateExample(role.id, exampleId, { title, content });
      setExamples((prev) => prev.map((ex) => (ex.id === exampleId ? updated : ex)));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al guardar ejemplo", "error");
    } finally {
      setSavingExample(null);
    }
  };

  const removeExample = async (exampleId: string) => {
    setSavingExample(exampleId);
    try {
      await aiRoles.deleteExample(role.id, exampleId);
      setExamples((prev) => {
        const next = prev.filter((ex) => ex.id !== exampleId);
        if (selectedExampleId === exampleId) {
          setSelectedExampleId(next[0]?.id ?? null);
        }
        return next;
      });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al eliminar ejemplo", "error");
    } finally {
      setSavingExample(null);
    }
  };

  const onUploadPdf = async (file: File | null) => {
    if (!file) return;
    setUploadingPdf(true);
    try {
      const created = await aiRoles.uploadKnowledgeFile(role.id, file);
      setKnowledgeFiles((prev) => [created, ...prev]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al subir PDF", "error");
    } finally {
      setUploadingPdf(false);
    }
  };

  const removePdf = async (fileId: string) => {
    try {
      await aiRoles.deleteKnowledgeFile(role.id, fileId);
      setKnowledgeFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al eliminar PDF", "error");
    }
  };

  return (
    <div role="tabpanel" className="bots-layout">
      <article className="surface-card surface-card--accent bots-col-left">
        <header className="surface-card__head">
          <span className="surface-card__eyebrow">Instrucciones</span>
          <h2 className="surface-card__title">Comportamiento en WhatsApp</h2>
          <p className="surface-card__desc">
            Definí la personalidad y límites del bot. Id técnico: <code className="bot-editor-key">{role.key}</code>.
          </p>
        </header>
        <div className="surface-card__body">
          <FormGroup label="Nombre visible" error={fieldErrors.name}>
            {(props) => (
              <input
                {...props}
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((prev) => ({ ...prev, name: "" })); }}
                onBlur={() => { if (!name.trim()) setFieldErrors((prev) => ({ ...prev, name: "El nombre no puede estar vacío" })); }}
              />
            )}
          </FormGroup>
          <FormGroup label="Reglas e instrucciones" error={fieldErrors.systemPrompt}>
            {(props) => (
              <textarea
                {...props}
                value={systemPrompt}
                onChange={(e) => { setSystemPrompt(e.target.value); setFieldErrors((prev) => ({ ...prev, systemPrompt: "" })); }}
                onBlur={() => { if (!systemPrompt.trim()) setFieldErrors((prev) => ({ ...prev, systemPrompt: "Las instrucciones no pueden estar vacías" })); }}
                rows={14}
              />
            )}
          </FormGroup>
          <div className="form-actions" style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving || !dirty || !name.trim() || !systemPrompt.trim()}
              onClick={() => {
                const newErrors: Record<string, string> = {};
                if (!name.trim()) newErrors.name = "El nombre no puede estar vacío";
                if (!systemPrompt.trim()) newErrors.systemPrompt = "Las instrucciones no pueden estar vacías";
                if (Object.keys(newErrors).length > 0) { setFieldErrors(newErrors); return; }
                onSave(role.id, name, systemPrompt);
              }}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </article>

      <div className="bots-col-right-wrap">
      <article className="surface-card bots-col-right bots-col-right-top">
        <header className="surface-card__head">
          <span className="surface-card__eyebrow">Conversaciones</span>
          <h2 className="surface-card__title">Ejemplos (máximo 3)</h2>
          <p className="surface-card__desc">Usalos como referencia de tono y estructura de respuesta.</p>
        </header>
        <div className="surface-card__body bots-examples-grid">
          <div className="card" style={{ background: "var(--bg)" }}>
            {isCreatingExample ? (
              <div>
                <div className="form-group">
                  <label>Título</label>
                  <input value={newExampleTitle} onChange={(e) => setNewExampleTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Conversación</label>
                  <textarea
                    rows={8}
                    value={newExampleContent}
                    onChange={(e) => setNewExampleContent(e.target.value)}
                    placeholder={"Cliente: Hola, necesito precio\nBot: Claro, te cuento..."}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={savingExample === "new" || !newExampleTitle.trim() || !newExampleContent.trim()}
                    onClick={addExample}
                  >
                    {savingExample === "new" ? "Guardando…" : "Crear"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={savingExample === "new"}
                    onClick={() => {
                      setIsCreatingExample(false);
                      setNewExampleTitle("");
                      setNewExampleContent("");
                      if (!selectedExampleId && examples.length > 0) setSelectedExampleId(examples[0].id);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : selectedExample ? (
              <ExampleEditor
                example={selectedExample}
                saving={savingExample === selectedExample.id}
                onSave={saveExample}
                onDelete={removeExample}
              />
            ) : (
              <p className="page-empty" style={{ margin: 0 }}>
                Seleccioná una conversación ejemplo para visualizarla.
              </p>
            )}
          </div>

          <div className="card" style={{ background: "var(--bg)", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
              <strong style={{ fontSize: "0.85rem" }}>Todas las conversaciones</strong>
              {!maxExamplesReached && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setIsCreatingExample(true);
                    setSelectedExampleId(null);
                    setNewExampleTitle("");
                    setNewExampleContent("");
                  }}
                >
                  Crear
                </button>
              )}
            </div>
            {examples.length === 0 ? (
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Sin ejemplos cargados</span>
            ) : (
              examples.map((ex, idx) => (
                <button
                  key={ex.id}
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setSelectedExampleId(ex.id);
                    setIsCreatingExample(false);
                  }}
                  style={{
                    textAlign: "left",
                    borderColor: selectedExampleId === ex.id ? "var(--accent-strong)" : undefined,
                    background: selectedExampleId === ex.id ? "var(--accent-dim)" : undefined,
                  }}
                >
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>#{idx + 1} {ex.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ex.content}
                  </div>
                </button>
              ))
            )}

          </div>
        </div>
      </article>

      <article className="surface-card bots-col-right">
        <header className="surface-card__head">
          <span className="surface-card__eyebrow">Knowledge Base</span>
          <h2 className="surface-card__title">Documentos PDF</h2>
          <p className="surface-card__desc">Subí material para usarlo como base de conocimiento del bot.</p>
        </header>
        <div className="surface-card__body">
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={uploadingPdf}
            onChange={(e) => onUploadPdf(e.target.files?.[0] ?? null)}
          />
          <div style={{ marginTop: "0.8rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {knowledgeFiles.length === 0 ? (
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Sin PDFs cargados</span>
            ) : (
              knowledgeFiles.map((file) => (
                <div key={file.id} className="card" style={{ padding: "0.6rem 0.8rem", background: "var(--bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.84rem", overflow: "hidden", textOverflow: "ellipsis" }}>{file.originalName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removePdf(file.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
      </div>
    </div>
  );
}

function ExampleEditor({
  example,
  saving,
  onSave,
  onDelete,
}: {
  example: AiRoleExample;
  saving: boolean;
  onSave: (id: string, title: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(example.title);
  const [content, setContent] = useState(example.content);

  useEffect(() => {
    setTitle(example.title);
    setContent(example.content);
  }, [example.id, example.title, example.content]);

  const dirty = title !== example.title || content !== example.content;

  return (
    <div>
      <div className="form-group">
        <label>Título</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Conversación</label>
        <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={saving || !dirty || !title.trim() || !content.trim()}
          onClick={() => onSave(example.id, title.trim(), content.trim())}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={saving} onClick={() => onDelete(example.id)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}
