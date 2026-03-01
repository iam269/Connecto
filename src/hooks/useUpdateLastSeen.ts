import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to automatically update the user's last_seen_at timestamp
 * when they are active in the app. This is used to determine online status.
 */
export function useUpdateLastSeen() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const updateLastSeen = async () => {
      try {
        await supabase
          .from("profiles")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error updating last_seen_at:", error);
      }
    };

    // Update immediately when the component mounts
    updateLastSeen();

    // Update every 2 minutes while the user is active
    intervalRef.current = setInterval(updateLastSeen, 2 * 60 * 1000);

    // Also update when the user makes any request (page navigation, etc.)
    const handleActivity = () => {
      // Debounce the update
      if (intervalRef.current) {
        clearTimeout(intervalRef.current as unknown as number);
      }
      intervalRef.current = setTimeout(updateLastSeen, 1000);
    };

    // Listen for user activity
    window.addEventListener("click", handleActivity);
    window.addEventListener("keypress", handleActivity);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keypress", handleActivity);
    };
  }, [user]);
}
