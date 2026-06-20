import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { superAdmin, type SuperAdmin } from "./api";

type SuperAuthState = {
  admin: SuperAdmin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const SuperAuthContext = createContext<SuperAuthState | null>(null);

export function SuperAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdmin.me()
      .then((r) => setAdmin(r.admin))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await superAdmin.login(email, password);
    setAdmin(res.admin);
  };

  const logout = async () => {
    await superAdmin.logout().catch(() => {});
    setAdmin(null);
  };

  return (
    <SuperAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </SuperAuthContext.Provider>
  );
}

export function useSuperAuth() {
  const ctx = useContext(SuperAuthContext);
  if (!ctx) throw new Error("useSuperAuth must be inside SuperAuthProvider");
  return ctx;
}
