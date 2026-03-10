import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import type { Session, User } from "@supabase/supabase-js";


interface AuthContextType {
  session: Session | null | undefined;
  user: User | null;
  loading: boolean;
  signUpNewUser: (email: string, password: string, first: string, last: string) => Promise<{ success: boolean; error?: any; data?: any }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: any; user?: User }>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Derive user directly from session
  const user = session?.user ?? null;

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Handle Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpNewUser = async (email: string, password: string, first: string, last: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error };

    // Create profile entry on successful signup
    if (data.user) {
      await supabase.from('profiles').insert([{
        id: data.user.id,
        email,
        first_name: first,
        last_name: last,
        role: 'student'
        // NOTE: college_office is intentionally left empty here.
        // The user will fill it in on the /complete-profile page.
      }]);
    }
    return { success: true, data };
  };

  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user ?? null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    // FIX: Use the deployed site URL from env so OAuth doesn't redirect back
    // to localhost in production. Set VITE_SITE_URL in your .env.production
    // e.g. VITE_SITE_URL=https://your-app.vercel.app
    // Also add this URL to: Supabase → Auth → URL Configuration → Redirect URLs
    const siteUrl = import.meta.env.VITE_SITE_URL ?? window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/dashboard`,
      },
    });
  };

  const signOutUser = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUpNewUser,
        signInUser,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {/* Ensure children only render once auth is initialized */}
      {!loading ? children : (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#0f172a' }}>
          <h2>Syncing NEU Intelligence...</h2>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UserAuth must be used within AuthContextProvider");
  }
  return context;
};