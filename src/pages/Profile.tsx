import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "../ThemeToggle";
import { Button, PageHeader, SurfaceCard } from "../components/ui";

export default function Profile() {
  const { member, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabel =
    member?.role === "admin" ? "Administrador" : member?.role === "agent" ? "Agente" : "—";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="panel settings-page" style={{ flex: 1, overflow: "auto" }}>
      <PageHeader title="Perfil" subtitle="Tu cuenta y preferencias de la aplicaci&#243;n." />

      <div className="page-body">
        <SurfaceCard
          accent
          eyebrow="Cuenta"
          title="Datos de tu usuario"
          description="Esta informaci&#243;n est&#225; vinculada a tu sesi&#243;n en Hermes IA."
        >
          <div className="account-strip">
            <div className="account-stat">
              <div className="account-stat__label">Nombre</div>
              <div className="account-stat__value">{member?.name ?? "—"}</div>
            </div>
            <div className="account-stat">
              <div className="account-stat__label">Email</div>
              <div className="account-stat__value">{member?.email ?? "—"}</div>
            </div>
            <div className="account-stat">
              <div className="account-stat__label">Rol</div>
              <div className="account-stat__value">{roleLabel}</div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Apariencia" title="Tema de la interfaz">
          <div className="appearance-row">
            <div className="appearance-row__text">
              <strong>Modo claro u oscuro</strong>
              <span>Se guarda en este navegador y respeta tu elecci&#243;n al volver.</span>
            </div>
            <ThemeToggle />
          </div>
        </SurfaceCard>

        <div className="signout-block">
          <Button variant="ghost" onClick={handleLogout}>
            Cerrar sesi&#243;n
          </Button>
        </div>
      </div>
    </div>
  );
}
