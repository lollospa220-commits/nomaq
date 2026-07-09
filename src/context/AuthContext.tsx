import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabaseClient';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  authAvailable: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The mock Supabase client (used when env vars are missing) has no .auth —
// in that case auth features are disabled gracefully.
const authClient = (supabase as any)?.auth;
const authAvailable = typeof authClient?.onAuthStateChange === 'function';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(authAvailable);

  const loadProfile = async (u: any) => {
    if (!u) {
      setProfile(null);
      return;
    }
    const fallback: Profile = {
      id: u.id,
      email: u.email ?? null,
      full_name: u.user_metadata?.full_name ?? null,
      avatar_url: u.user_metadata?.avatar_url ?? null,
    };
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();
      if (data) {
        // The DB trigger creates the row at signup but may leave full_name
        // empty — merge with the auth metadata so the UI always has a name.
        setProfile({
          ...data,
          full_name: data.full_name ?? fallback.full_name,
          avatar_url: data.avatar_url ?? fallback.avatar_url,
        } as Profile);
        if (!data.full_name && fallback.full_name) {
          // Best-effort backfill; silently a no-op unless an UPDATE policy exists.
          await supabase
            .from('profiles')
            .update({ full_name: fallback.full_name })
            .eq('id', u.id);
        }
        return;
      }
      // No row yet (e.g. no DB trigger): create it from the auth metadata.
      setProfile(fallback);
      await supabase.from('profiles').upsert(fallback);
    } catch {
      setProfile(fallback);
    }
  };

  useEffect(() => {
    if (!authAvailable) return;

    authClient
      .getSession()
      .then(({ data }: any) => {
        const u = data?.session?.user ?? null;
        setUser(u);
        return loadProfile(u);
      })
      .finally(() => setLoading(false));

    const { data: sub } = authClient.onAuthStateChange((_event: string, session: any) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u);
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!authAvailable) return { error: 'AUTH_UNAVAILABLE' };
    const { error } = await authClient.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    if (!authAvailable) return { error: 'AUTH_UNAVAILABLE', needsConfirmation: false };
    const { data, error } = await authClient.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    if (data?.user && data?.session) {
      // Session immediately active (email confirmation disabled): persist the profile row.
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
        });
      } catch {
        // RLS may block this; the profile falls back to auth metadata.
      }
    }
    return { error: null, needsConfirmation: !data?.session };
  }, []);

  const signOut = useCallback(async () => {
    if (authAvailable) await authClient.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  // value memoizzato: evita di ri-renderizzare tutti i consumer di useAuth a
  // ogni render del provider quando user/profile/loading non sono cambiati.
  const value = useMemo(
    () => ({ user, profile, loading, authAvailable, signIn, signUp, signOut }),
    [user, profile, loading, signIn, signUp, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Fail-safe default for components rendered outside the provider (tests)
    return {
      user: null,
      profile: null,
      loading: false,
      authAvailable: false,
      signIn: async () => ({ error: 'AUTH_UNAVAILABLE' }),
      signUp: async () => ({ error: 'AUTH_UNAVAILABLE', needsConfirmation: false }),
      signOut: async () => {},
    };
  }
  return context;
};
