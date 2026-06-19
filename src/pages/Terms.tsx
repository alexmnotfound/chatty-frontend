import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="legal-page">
      <Link to="/" className="legal-back">
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      <h1>Términos de uso</h1>
      <p className="legal-date">Última actualización: junio de 2026</p>

      <p>
        Al acceder y utilizar Hermes IA ("el Servicio"), aceptás los presentes Términos de Uso. Si no estás de acuerdo con alguno de estos términos, no utilices el Servicio.
      </p>

      <h2>1. Descripción del servicio</h2>
      <p>
        Hermes IA es una plataforma que permite a equipos de trabajo gestionar conversaciones de WhatsApp mediante un inbox compartido, agentes de inteligencia artificial y gestión de tareas. El Servicio se integra con la API de WhatsApp Cloud de Meta.
      </p>

      <h2>2. Registro y cuenta</h2>
      <p>
        Para utilizar el Servicio debés crear una cuenta con información veraz y completa. Sos responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas desde tu cuenta.
      </p>
      <p>
        Las cuentas nuevas quedan pendientes de activación manual por parte del equipo de Hermes IA. Nos reservamos el derecho de rechazar o cancelar cuentas a nuestra discreción.
      </p>

      <h2>3. Uso aceptable</h2>
      <p>Te comprometés a no utilizar el Servicio para:</p>
      <ul>
        <li>Enviar spam, mensajes masivos no solicitados o contenido engañoso.</li>
        <li>Violar las políticas de uso de WhatsApp Business y la API de Meta.</li>
        <li>Recopilar datos de terceros sin su consentimiento.</li>
        <li>Realizar actividades ilegales o que infrinjan derechos de terceros.</li>
      </ul>

      <h2>4. Propiedad intelectual</h2>
      <p>
        El código, diseño y contenido del Servicio son propiedad de Hermes IA. No se te concede ningún derecho de reproducción, distribución o modificación sin autorización expresa.
      </p>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        El Servicio se provee "tal como está". Hermes IA no garantiza disponibilidad continua ni se responsabiliza por pérdidas de datos, interrupciones del servicio o daños derivados del uso del Servicio o de la API de WhatsApp.
      </p>

      <h2>6. Modificaciones</h2>
      <p>
        Nos reservamos el derecho de modificar estos términos en cualquier momento. Notificaremos cambios significativos con al menos 7 días de anticipación por correo electrónico.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Para consultas sobre estos términos escribinos a <a href="mailto:hola@hermesia.app" style={{ color: "var(--accent)" }}>hola@hermesia.app</a>.
      </p>
    </div>
  );
}
