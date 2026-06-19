import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="legal-page">
      <Link to="/" className="legal-back">
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      <h1>Política de privacidad</h1>
      <p className="legal-date">Última actualización: junio de 2026</p>

      <p>
        Esta política describe cómo Hermes IA recopila, usa y protege la información de sus usuarios.
      </p>

      <h2>1. Información que recopilamos</h2>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre de empresa, dirección de correo electrónico y contraseña (almacenada con hash).</li>
        <li><strong>Datos de conversación:</strong> mensajes de WhatsApp procesados a través de la API de Meta para brindar el Servicio.</li>
        <li><strong>Datos de uso:</strong> logs de actividad, accesos y métricas de funcionamiento del Servicio.</li>
      </ul>

      <h2>2. Cómo usamos tu información</h2>
      <ul>
        <li>Proveer, mantener y mejorar el Servicio.</li>
        <li>Enviarte comunicaciones relacionadas con tu cuenta (activación, cambios en los términos, alertas de seguridad).</li>
        <li>Detectar y prevenir fraude o uso indebido.</li>
      </ul>

      <h2>3. Compartir información</h2>
      <p>
        No vendemos ni compartimos tu información personal con terceros con fines comerciales. Podemos compartir datos con:
      </p>
      <ul>
        <li><strong>Meta / WhatsApp:</strong> necesario para procesar mensajes vía la API de WhatsApp Cloud.</li>
        <li><strong>Proveedores de infraestructura:</strong> Supabase (base de datos y autenticación), proveedores de LLM para los agentes de IA.</li>
        <li><strong>Autoridades competentes:</strong> cuando lo exija la ley aplicable.</li>
      </ul>

      <h2>4. Retención de datos</h2>
      <p>
        Los mensajes y datos de conversación se conservan mientras la cuenta esté activa. Al cancelar tu cuenta, tus datos se eliminan en un plazo de 30 días, excepto cuando la ley exija su conservación.
      </p>

      <h2>5. Seguridad</h2>
      <p>
        Utilizamos cifrado en tránsito (TLS) y en reposo. El acceso a los datos está restringido por roles y auditado. Sin embargo, ningún sistema es 100% seguro; te recomendamos usar una contraseña fuerte y única.
      </p>

      <h2>6. Tus derechos</h2>
      <p>Podés solicitar en cualquier momento:</p>
      <ul>
        <li>Acceso a los datos que tenemos sobre vos.</li>
        <li>Corrección de información incorrecta.</li>
        <li>Eliminación de tu cuenta y datos asociados.</li>
        <li>Portabilidad de tus datos en formato JSON.</li>
      </ul>
      <p>
        Enviá tu solicitud a <a href="mailto:privacidad@hermesia.app" style={{ color: "var(--accent)" }}>privacidad@hermesia.app</a>.
      </p>

      <h2>7. Cookies</h2>
      <p>
        El Servicio utiliza cookies de sesión estrictamente necesarias para la autenticación. No utilizamos cookies de rastreo publicitario.
      </p>

      <h2>8. Cambios a esta política</h2>
      <p>
        Notificaremos cambios significativos por correo electrónico con al menos 7 días de anticipación.
      </p>
    </div>
  );
}
