import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../AuthContext";
import { TextParallaxContent, ParallaxSectionContent } from "../components/TextParallaxContent";

export default function Landing() {
  const { member } = useAuth();

  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-logo">Chatty</Link>
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
              <Link to="/register" className="btn btn-primary landing-header-cta">
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
                <Link to="/register" className="btn btn-primary landing-cta-large">
                  Empezar gratis
                </Link>
                <Link to="/login" className="btn btn-ghost landing-cta-secondary">
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </section>

        <section id="features">
          <TextParallaxContent
            imgUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
            subheading="Inbox compartido"
            heading="Un número, todo el equipo."
          >
            <ParallaxSectionContent
              title="Visibilidad total en tiempo real"
              body="Todas las conversaciones de WhatsApp en un solo lugar. Tu equipo ve quién atiende cada chat, si está a cargo la IA o un humano, y puede tomar el relevo en cualquier momento sin perder el historial."
              ctaLabel="Empezar ahora"
              ctaTo="/register"
            />
          </TextParallaxContent>

          <TextParallaxContent
            imgUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop"
            subheading="Agentes de IA"
            heading="Responde primero, siempre."
          >
            <ParallaxSectionContent
              title="Recepcionista y vendedor con IA"
              body="Configurá roles con instrucciones propias: una IA recibe consultas generales y otra cierra ventas. Cambiá el rol activo según el momento, sin tocar código."
              ctaLabel="Ver cómo funciona"
              ctaTo="/register"
            />
          </TextParallaxContent>

          <TextParallaxContent
            imgUrl="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2672&auto=format&fit=crop"
            subheading="Gestión de tareas"
            heading="Del mensaje a la tarea."
          >
            <ParallaxSectionContent
              title="Sin fricción, sin cambiar de app"
              body="Convertí cualquier conversación en una tarea asignada con estado y responsable. El seguimiento queda vinculado al chat, y tu equipo sabe exactamente qué falta resolver."
              ctaLabel="Crear cuenta gratis"
              ctaTo="/register"
            />
          </TextParallaxContent>
        </section>

        <section className="landing-cta-band">
          <div className="landing-cta-inner">
            <h2>¿Listo para probarlo en tu entorno?</h2>
            <p>Registrate, conectá tu número de WhatsApp y en minutos tenés el inbox funcionando con IA.</p>
            {!member && (
              <Link to="/register" className="btn btn-primary landing-cta-large">
                Crear cuenta gratis
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-logo">Chatty</Link>
            <p>Inbox de WhatsApp con IA para equipos que no pueden perder una consulta.</p>
          </div>
          <div className="landing-footer-col">
            <h4>Producto</h4>
            <ul>
              <li><a href="#features">Funciones</a></li>
              <li><Link to="/register">Empezar gratis</Link></li>
              <li><Link to="/login">Iniciar sesión</Link></li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/terms">Términos de uso</Link></li>
              <li><Link to="/privacy">Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} Chatty. Todos los derechos reservados.</span>
          <span>Hecho con WhatsApp Cloud API</span>
        </div>
      </footer>
    </div>
  );
}
