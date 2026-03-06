import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null | undefined;
  user: User | null;
  loading: boolean;
  signUpNewUser: (email: string, password: string, first: string, last: string) => Promise<{ success: boolean; error?: any }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: any; user?: User }>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const user = session?.user ?? null;

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUpNewUser = async (email: string, password: string, first: string, last: string) => {
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return { success: false, error: authError };
    if (data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, email, first_name: first, last_name: last, role: 'student' }]);
    }
    return { success: true };
  };

  const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user ?? null };
  };

  const signOutUser = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUpNewUser, signInUser, signOutUser }}>
      {loading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#0f172a' }}>
          <h2>Loading NEU Library...</h2>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("UserAuth must be used within AuthContextProvider");
  return context;
};