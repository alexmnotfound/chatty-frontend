import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

interface Member {
  id: string;
  userId: string;
  companyId: string;
  role: string;
  email?: string;
  name?: string;
  enabled?: boolean;
}

interface AuthContextType {
  member: Member | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  setMember: (member: Member | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function loadMemberForSession(session: Session | null): Promise<Member | null> {
  if (!session) return null;
  const { data } = await supabase
    .from('company_members')
    .select('id, user_id, company_id, role')
    .eq('user_id', session.user.id)
    .single();
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    companyId: data.company_id,
    role: data.role,
    email: session.user.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadMemberForSession(session)
        .then(setMember)
        .finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadMemberForSession(session).then(setMember);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
    setMember(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ member, session, login, logout, loading, setMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
