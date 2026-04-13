import { Link } from "react-router-dom";
import { Inbox, Bot, ListTodo } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../AuthContext";

export default function Landing() {
  const { member } = useAuth();

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="landing-logo">Chatty</span>
        <div className="landing-header-actions">
          <ThemeToggle />
          {member ? (
            <Link to="/inbox" className="btn btn-primary landing-header-cta">
              Ir al panel
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-link">
                Iniciar sesión
              </Link>
              <Link to="/login" className="btn btn-primary landing-header-cta">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <p className="landing-eyebrow">WhatsApp + IA para tu equipo</p>
          <h1 className="landing-title">
            Un solo número.
            <br />
            <span className="landing-title-accent">Toda la conversación bajo control.</span>
          </h1>
          <p className="landing-lead">
            Recepcionista y vendedor con IA, inbox compartido y tareas que nacen del chat. Tu equipo puede tomar el
            relevo cuando haga falta.
          </p>
          <div className="landing-hero-ctas">
            {member ? (
              <Link to="/inbox" className="btn btn-primary landing-cta-large">
                Abrir inbox
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary landing-cta-large">
                  Empezar gratis
                </Link>
                <Link to="/login" className="btn btn-ghost landing-cta-secondary">
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="landing-features" aria-labelledby="features-heading">
          <h2 id="features-heading" className="landing-section-title">
            Pensado para operaciones reales
          </h2>
          <ul className="landing-grid">
            <li className="landing-card">
              <span className="landing-card-icon" aria-hidden>
                <Inbox size={24} />
              </span>
              <h3>Inbox unificado</h3>
              <p>Todas las conversaciones por contacto, con historial claro y estado IA o humano visible de un vistazo.</p>
            </li>
            <li className="landing-card">
              <span className="landing-card-icon" aria-hidden>
                <Bot size={24} />
              </span>
              <h3>Roles de IA</h3>
              <p>Recepcionista y vendedor con instrucciones propias. Cambiá el rol según el tipo de consulta.</p>
            </li>
            <li className="landing-card">
              <span className="landing-card-icon" aria-hidden>
                <ListTodo size={24} />
              </span>
              <h3>Tareas desde el chat</h3>
              <p>Derivá seguimientos a tareas con asignación y estados, sin perder el hilo con WhatsApp.</p>
            </li>
          </ul>
        </section>

        <section className="landing-cta-band">
          <div className="landing-cta-inner">
            <h2>¿Listo para probarlo en tu entorno?</h2>
            <p>Configurá Meta Cloud API, conectá el webhook y en minutos tenés el MVP corriendo en local o en tu VPS.</p>
            {!member && (
              <Link to="/login" className="btn btn-primary landing-cta-large">
                Crear cuenta
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>Chatty — MVP</span>
        <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noreferrer">
          WhatsApp Cloud API
        </a>
      </footer>
    </div>
  );
}
