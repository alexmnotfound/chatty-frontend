import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { SuperAuthProvider, useSuperAuth } from "./SuperAuthContext";
import { ToastProvider } from "./components/ui/Toast";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Bots from "./pages/Bots";
import SuperLogin from "./pages/SuperLogin";
import SuperDashboard from "./pages/SuperDashboard";

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
      </Route>
      <Route path="/super/login" element={<SuperAuthProvider><SuperLogin /></SuperAuthProvider>} />
      <Route path="/super" element={<SuperAuthProvider><SuperProtected><SuperDashboard /></SuperProtected></SuperAuthProvider>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ToastProvider>
  );
}
