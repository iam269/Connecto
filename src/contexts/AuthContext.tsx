import { useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

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

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      // Check if input looks like an email or username
      let email = emailOrUsername;
      
      // If it doesn't contain @, treat it as username and convert to internal email
      if (!emailOrUsername.includes('@')) {
        email = `${emailOrUsername.toLowerCase()}@connecto.local`;
      }

      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes("Invalid login credentials") || error.message.includes("invalid")) {
          throw new Error("Invalid username or password. Please check your credentials and try again.");
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

  const signUp = async (username: string, password: string, metadata?: { username?: string; full_name?: string }) => {
    try {
      // Validate password minimum length
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      // Validate username
      if (!username || username.length < 3) {
        throw new Error("Username must be at least 3 characters long.");
      }

      // Use Edge Function to create user without email verification
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ username, password, metadata }),
      });

      const data = await response.json();
      
      if (data.error) {
        if (data.error.includes("already taken")) {
          throw new Error("Username already taken. Please choose a different username.");
        }
        throw new Error(data.error);
      }

      // Automatically sign in after successful signup
      // Use the generated email for login
      const generatedEmail = `${username.toLowerCase()}@connecto.local`;
      await signIn(generatedEmail, password);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // If guest, just clear local state
      if (isGuest) {
        setIsGuest(false);
        setUser(null);
        setSession(null);
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Signout error:", error);
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      setIsGuest(true);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Guest signin error:", error);
      throw error;
    }
  };

  const value: AuthContextType = { user, session, loading, isGuest, signUp, signIn, signInAsGuest, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
