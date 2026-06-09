import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ThemeToggle from "./ThemeToggle";
import { conversations } from "./api";
import { Menu } from "lucide-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDashboard,
  IconInbox,
  IconLogOut,
  IconSettings,
  IconTasks,
  IconUsers,
  IconBot,
  IconReceipt,
  IconSheets,
} from "./components/SidebarIcons";

const SIDEBAR_COLLAPSED_KEY = "chatty-sidebar-collapsed";

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

export default function Layout() {
  const { member, logout } = useAuth();
  const navigate = useNavigate();
  const [inboxUnreadTotal, setInboxUnreadTotal] = useState(0);
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

  useEffect(() => {
    let cancelled = false;

    const refreshUnread = async () => {
      try {
        const list = await conversations.list();
        if (cancelled) return;
        const total = list.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setInboxUnreadTotal(total);
      } catch {
        if (!cancelled) setInboxUnreadTotal(0);
      }
    };

    void refreshUnread();
    const onUnreadChanged = (evt: Event) => {
      const custom = evt as CustomEvent<{ total?: number }>;
      if (typeof custom.detail?.total === "number") {
        setInboxUnreadTotal(custom.detail.total);
        return;
      }
      void refreshUnread();
    };
    const onFocus = () => void refreshUnread();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshUnread();
    };

    window.addEventListener("chatty:inbox-unread-changed", onUnreadChanged);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => void refreshUnread(), 5000);
    return () => {
      cancelled = true;
      window.removeEventListener("chatty:inbox-unread-changed", onUnreadChanged);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-nav-link ${isActive ? "active" : ""}`.trim();

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Ir al contenido</a>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`} aria-label="Navegación principal">
        <div className="sidebar-header">
          <span className="sidebar-brand">Chatty</span>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir menú" : "Minimizar menú"}
            title={collapsed ? "Expandir" : "Minimizar"}
          >
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Secciones">
          <p className="sidebar-section-label">Principal</p>
          <NavLink
            to="/inbox"
            className={linkClass}
            end={false}
            title={collapsed ? "Inbox" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <IconInbox className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">Inbox</span>
            {inboxUnreadTotal > 0 && <span className="sidebar-nav-counter">{inboxUnreadTotal}</span>}
          </NavLink>
          <NavLink to="/tasks" className={linkClass} end={false} title={collapsed ? "Tareas" : undefined} onClick={() => setMobileOpen(false)}>
            <IconTasks className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">Tareas</span>
          </NavLink>
          <NavLink
            to="/dashboard"
            className={linkClass}
            end={false}
            title={collapsed ? "Dashboard" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <IconDashboard className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">Dashboard</span>
          </NavLink>

          {member?.role === "admin" && (
            <>
              <p className="sidebar-section-label">IA</p>
              <NavLink to="/bots" className={linkClass} title={collapsed ? "Reglas de bots" : undefined} onClick={() => setMobileOpen(false)}>
                <IconBot className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Reglas de bots</span>
              </NavLink>
              <NavLink to="/comprobantes" className={linkClass} title={collapsed ? "Comprobantes" : undefined} onClick={() => setMobileOpen(false)}>
                <IconReceipt className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Comprobantes</span>
              </NavLink>
              <NavLink to="/sheets-config" className={linkClass} title={collapsed ? "Google Sheets" : undefined} onClick={() => setMobileOpen(false)}>
                <IconSheets className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">Google Sheets</span>
              </NavLink>
            </>
          )}

          <p className="sidebar-section-label">Administración</p>
          {member?.role === "admin" && (
            <NavLink to="/users" className={linkClass} title={collapsed ? "Usuarios" : undefined} onClick={() => setMobileOpen(false)}>
              <IconUsers className="sidebar-nav-icon" />
              <span className="sidebar-nav-text">Usuarios</span>
            </NavLink>
          )}
          <NavLink to="/settings" className={linkClass} title={collapsed ? "Configuración" : undefined} onClick={() => setMobileOpen(false)}>
            <IconSettings className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">Configuración</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar" aria-hidden>
              {initialsFromName(member?.name)}
            </div>
            <div className="sidebar-user-meta">
              <span className="sidebar-user-name">{member?.name ?? "—"}</span>
              <span className="sidebar-user-email">{member?.email ?? ""}</span>
              <span className="sidebar-user-badge">{member?.role === "admin" ? "Admin" : "Agente"}</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <IconLogOut className="sidebar-logout-icon" />
            <span className="sidebar-logout-text">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="app-content-wrap">
        <header className="app-topbar">
          <button
            type="button"
            className="sidebar-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Abrir menú"
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
