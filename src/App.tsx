import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { SuperAuthProvider, useSuperAuth } from "./SuperAuthContext";
import { ToastProvider } from "./components/ui/Toast";
import Layout from "./Layout";
import SuperLayout from "./SuperLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Bots from "./pages/Bots";
import BotRules from "./pages/BotRules";
import Extractor from "./pages/Extractor";
import SheetsConfig from "./pages/SheetsConfig";
import Comprobantes from "./pages/Comprobantes";
import SuperLogin from "./pages/SuperLogin";
import SuperCompanies from "./pages/SuperCompanies";
import SuperCompanyDetail from "./pages/SuperCompanyDetail";

function Protected({ children }: { children: React.ReactNode }) {
  const { member } = useAuth();
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
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/inbox/:conversationId" element={<Inbox />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:taskId" element={<Tasks />} />
      <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
        <Route path="/bots" element={<Bots />} />
        <Route path="/bots/:id/rules" element={<BotRules />} />
        <Route path="/comprobantes" element={<Comprobantes />} />
        <Route path="/extractor" element={<Extractor />} />
        <Route path="/extractor/:docId" element={<Extractor />} />
        <Route path="/sheets-config" element={<SheetsConfig />} />
      </Route>
      <Route path="/super/login" element={<SuperAuthProvider><SuperLogin /></SuperAuthProvider>} />
      <Route element={<SuperAuthProvider><SuperProtected><SuperLayout /></SuperProtected></SuperAuthProvider>}>
        <Route path="/super" element={<Navigate to="/super/companies" replace />} />
        <Route path="/super/companies" element={<SuperCompanies />} />
        <Route path="/super/companies/:id" element={<SuperCompanyDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ToastProvider>
  );
}
