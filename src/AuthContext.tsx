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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (event === 'INITIAL_SESSION') {
        await loadMemberForSession(session).then(setMember).catch(console.error);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        // Supabase client fires this on signOut() — clear member state
        setMember(null);
      }
      // SIGNED_IN: handled by login() directly to avoid race where the
      // Supabase client's session isn't fully propagated when this callback
      // fires, causing loadMemberForSession to return null and wiping member.
      // TOKEN_REFRESHED: session is still valid, member data hasn't changed.
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('auth');
    const m = await loadMemberForSession(data.session);
    if (!m) {
      await supabase.auth.signOut();
      throw new Error('no_member');
    }
    setMember(m);
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
