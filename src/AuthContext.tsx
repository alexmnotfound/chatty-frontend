import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, type AuthMember } from "./api";

type Member = AuthMember | null;

function memberFromStorage(): Member {
  try {
    const s = localStorage.getItem("member");
    if (!s) return null;
    const m = JSON.parse(s) as Partial<AuthMember>;
    if (!m?.id || !m?.email) return null;
    const role = m.role === "admin" || m.role === "agent" ? m.role : "agent";
    const enabled = m.enabled !== false;
    return { id: m.id, email: m.email, name: m.name ?? "", role, enabled, companyId: m.companyId ?? "" };
  } catch {
    return null;
  }
}

const AuthContext = createContext<{
  member: Member;
  setMember: (m: Member) => void;
  login: (token: string, member: Member) => void;
  logout: () => void;
}>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member>(() => memberFromStorage());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let cancelled = false;
    auth
      .me()
      .then((r) => {
        if (!cancelled) {
          setMember(r.member);
          localStorage.setItem("member", JSON.stringify(r.member));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((token: string, m: Member) => {
    if (token) localStorage.setItem("token", token);
    if (m) localStorage.setItem("member", JSON.stringify(m));
    setMember(m);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("member");
    setMember(null);
  }, []);

  useEffect(() => {
    if (member) localStorage.setItem("member", JSON.stringify(member));
  }, [member]);

  return (
    <AuthContext.Provider value={{ member, setMember, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
