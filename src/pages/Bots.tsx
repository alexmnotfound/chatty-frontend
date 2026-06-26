import { toast } from "../lib/toast";
import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { bots, type Bot } from "../api";
import { useAuth } from "../AuthContext";

export default function Bots() {
  const { member } = useAuth();
  const navigate = useNavigate();
  const [botList, setBotList] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    bots
      .list()
      .then(setBotList)
      .catch(() => toast("No se pudieron cargar los bots", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (member?.role !== "admin") return <Navigate to="/inbox" replace />;

  const filtered = botList.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (
    e: React.MouseEvent | React.ChangeEvent,
    bot: Bot
  ) => {
    e.stopPropagation();
    setTogglingId(bot.id);
    try {
      await bots.toggleActive(bot.id, !bot.is_active);
      setBotList((prev) =>
        prev.map((b) => (b.id === bot.id ? { ...b, is_active: !b.is_active } : b))
      );
    } catch {
      toast("No se pudo cambiar el estado del bot", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSetDefault = async (e: React.MouseEvent, bot: Bot) => {
    e.stopPropagation();
    try {
      await bots.setDefault(bot.id);
      setBotList((prev) => prev.map((b) => ({ ...b, is_default: b.id === bot.id })));
      toast(`"${bot.name}" es ahora el bot default`, "success");
    } catch {
      toast("No se pudo configurar el bot default", "error");
    }
  };

  return (
    <div className="panel" style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
      <div className="panel-toolbar panel-toolbar--page">
        <div className="bots-gallery-header">
          <div className="panel-toolbar-text">
            <strong>Bots</strong>
            <p className="panel-toolbar-sub">
              Configurá y activá tus asistentes de IA.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/bots/new")}>
            Nuevo bot
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="bots-gallery-search">
          <input
            type="search"
            placeholder="Buscar bot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar bot por nombre"
          />
        </div>

        {loading ? (
          <p className="page-empty">Cargando bots…</p>
        ) : botList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              Aún no tenés bots configurados. Creá el primero.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/bots/new")}>
              Nuevo bot
            </button>
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <p className="page-empty">No se encontraron bots con ese nombre.</p>
            ) : (
              <div className="bots-grid">
                {filtered.map((bot) => (
                  <article
                    key={bot.id}
                    className={`bot-card${bot.template_type ? ` bot-card--${bot.template_type}` : ""}`}
                    onClick={() => navigate(`/bots/${bot.id}/rules`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && navigate(`/bots/${bot.id}/rules`)
                    }
                    aria-label={`Configurar bot ${bot.name}`}
                  >
                    <div className="bot-card__portrait">
                      <div className="bot-card__avatar">
                        {bot.name.slice(0, 2).toUpperCase()}
                      </div>
                      <label
                        className={`bot-card__status bot-card__status--${bot.is_active ? "active" : "inactive"}`}
                        onClick={(e) => e.stopPropagation()}
                        title={
                          bot.is_active
                            ? "Activo — hacer clic para desactivar"
                            : "Inactivo — hacer clic para activar"
                        }
                      >
                        <input
                          type="checkbox"
                          style={{ display: "none" }}
                          checked={bot.is_active}
                          disabled={togglingId === bot.id}
                          onChange={(e) => handleToggleActive(e, bot)}
                          aria-label={`${bot.is_active ? "Desactivar" : "Activar"} bot ${bot.name}`}
                        />
                        {togglingId === bot.id ? "…" : bot.is_active ? "Activo" : "Inactivo"}
                      </label>
                    </div>

                    <div className="bot-card__info">
                      <h3 className="bot-card__name">{bot.name}</h3>
                      <div className="bot-card__badges">
                        {bot.template_type && (
                          <span className={`badge-template badge-template--${bot.template_type}`}>
                            {bot.template_type === "recepcionista" ? "Recepcionista" : "Comercial"}
                          </span>
                        )}
                        {bot.is_default && <span className="badge-default">Default</span>}
                      </div>
                      <p className="bot-card__model">{bot.aiModel}</p>
                      {!bot.is_default && (
                        <button
                          className="bot-card__set-default"
                          onClick={(e) => handleSetDefault(e, bot)}
                        >
                          Usar como default
                        </button>
                      )}
                    </div>
                  </article>
                ))}

                <button
                  className="bot-card bot-card--add"
                  onClick={() => navigate("/bots/new")}
                  aria-label="Crear nuevo bot"
                >
                  <span className="bot-card__plus">+</span>
                  <span>Nuevo bot</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
