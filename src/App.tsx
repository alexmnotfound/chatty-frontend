import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { SuperAuthProvider, useSuperAuth } from "./SuperAuthContext";
import { ToastProvider } from "./components/ui/Toast";
import Layout from "./Layout";
import SuperLayout from "./SuperLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Inbox from "./pages/Inbox";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Bots from "./pages/Bots";
import BotRules from "./pages/BotRules";
import Extractor from "./pages/Extractor";
import SheetsConfig from "./pages/SheetsConfig";
import BotBuilder from "./pages/BotBuilder";
import Comprobantes from "./pages/Comprobantes";
import Observability from "./pages/Observability";

const SuperLogin = lazy(() => import("./pages/SuperLogin"));
const SuperDashboard = lazy(() => import("./pages/SuperDashboard"));
const SuperCompanies = lazy(() => import("./pages/SuperCompanies"));
const SuperCompanyDetail = lazy(() => import("./pages/SuperCompanyDetail"));
const SuperUsers = lazy(() => import("./pages/SuperUsers"));
const SuperPlugins = lazy(() => import("./pages/SuperPlugins"));

function Protected({ children }: { children: React.ReactNode }) {
  const { member, loading } = useAuth();
  if (loading) return null;
  if (!member) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuperProtected({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useSuperAuth();
  if (loading) return null;
  if (!admin) return <Navigate to="/super/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/inbox/:conversationId" element={<Inbox />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:taskId" element={<Tasks />} />
      <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
        <Route path="/bots" element={<Bots />} />
        <Route path="/bots/new" element={<BotBuilder />} />
        <Route path="/bots/:id/rules" element={<BotRules />} />
        <Route path="/comprobantes" element={<Comprobantes />} />
        <Route path="/extractor" element={<Extractor />} />
        <Route path="/extractor/:docId" element={<Extractor />} />
        <Route path="/sheets-config" element={<SheetsConfig />} />
        <Route path="/observability" element={<Observability />} />
      </Route>
      <Route path="/super/login" element={<SuperAuthProvider><Suspense fallback={null}><SuperLogin /></Suspense></SuperAuthProvider>} />
      <Route element={<SuperAuthProvider><SuperProtected><SuperLayout /></SuperProtected></SuperAuthProvider>}>
        <Route path="/super" element={<Suspense fallback={null}><SuperDashboard /></Suspense>} />
        <Route path="/super/companies" element={<Suspense fallback={null}><SuperCompanies /></Suspense>} />
        <Route path="/super/companies/:id" element={<Suspense fallback={null}><SuperCompanyDetail /></Suspense>} />
        <Route path="/super/users" element={<Suspense fallback={null}><SuperUsers /></Suspense>} />
        <Route path="/super/plugins" element={<Suspense fallback={null}><SuperPlugins /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ToastProvider>
  );
}
