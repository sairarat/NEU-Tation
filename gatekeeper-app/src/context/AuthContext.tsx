import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null | undefined;
  user: User | null;                  // added user – many consumers expected this
  loading: boolean;
  signUpNewUser: (email: string, password: string) => Promise<{ success: boolean; error?: any; data?: any }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: any; user?: User }>; // return user directly
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;    // renamed to match consumers
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // derive user from session so that consumers can destructure { user }
  const user = session?.user ?? null;

  const signUpNewUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error };
    return { success: true, data };
  };

  const signInUser = async (email: string, password: string) => {
    try {
      // call Supabase and return only the `user` field; callers were doing result.user
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user ?? null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  };

  const signOutUser = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUpNewUser,
        signInUser,
        signInWithGoogle,
        signOutUser,          // make sure provider value matches interface
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("UserAuth must be used within AuthContextProvider");
  return context;
};