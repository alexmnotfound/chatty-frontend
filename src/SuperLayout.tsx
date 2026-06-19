import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSuperAuth } from "./SuperAuthContext";
import ThemeToggle from "./ThemeToggle";
import { Menu } from "lucide-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogOut,
} from "./components/SidebarIcons";

const SIDEBAR_COLLAPSED_KEY = "chatty-super-sidebar-collapsed";

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  );
}

function initialsFromName(name: string | undefined) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function SuperLayout() {
  const { admin, logout } = useSuperAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/super/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-nav-link ${isActive ? "active" : ""}`.trim();

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Ir al contenido</a>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`} aria-label="Navegacion super admin">
        <div className="sidebar-header">
          <span className="sidebar-brand">
            Chatty
            <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 500, opacity: 0.6, letterSpacing: "0.04em" }}>
              Super Admin
            </span>
          </span>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir menu" : "Minimizar menu"}
            title={collapsed ? "Expandir" : "Minimizar"}
          >
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Secciones">
          <p className="sidebar-section-label">Principal</p>
          <NavLink
            to="/super/companies"
            className={linkClass}
            end={false}
            title={collapsed ? "Empresas" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <IconBuilding className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">Empresas</span>
          </NavLink>
          <NavLink
            to="/super/users"
            className={linkClass}
            end={false}
            title={collapsed ? "Usuarios" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <svg className="sidebar-nav-icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="sidebar-nav-text">Usuarios</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar" aria-hidden>
              {initialsFromName(admin?.name)}
            </div>
            <div className="sidebar-user-meta">
              <span className="sidebar-user-name">{admin?.name ?? "—"}</span>
              <span className="sidebar-user-email">{admin?.email ?? ""}</span>
              <span className="sidebar-user-badge">SUPER</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesion" : undefined}
          >
            <IconLogOut className="sidebar-logout-icon" />
            <span className="sidebar-logout-text">Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <div className="app-content-wrap">
        <header className="app-topbar">
          <button
            type="button"
            className="sidebar-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <ThemeToggle />
        </header>
        <main className="app-main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
