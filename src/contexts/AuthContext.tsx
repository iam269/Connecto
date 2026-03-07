import { useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { username?: string; full_name?: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: metadata,
        },
      });
      
      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          throw new Error("This email is already registered. Please try logging in instead.");
        }
        if (error.message.includes("Password")) {
          throw new Error("Password must be at least 6 characters long.");
        }
        throw error;
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes("Invalid login credentials") || error.message.includes("invalid")) {
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Please check your email to confirm your account before logging in.");
        }
        if (error.message.includes("Too many requests")) {
          throw new Error("Too many login attempts. Please wait a few minutes and try again.");
        }
        throw error;
      }
    } catch (error) {
      console.error("Signin error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Signout error:", error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      
      if (error) {
        if (error.message.includes("too many requests")) {
          throw new Error("Too many requests. Please wait a few minutes before requesting another verification email.");
        }
        throw error;
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      throw error;
    }
  };

  const value: AuthContextType = { user, session, loading, signUp, signIn, signOut, resendVerificationEmail };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
