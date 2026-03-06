import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to automatically update the user's last_seen_at timestamp
 * when they are active in the app. This is used to determine online status.
 */
export function useUpdateLastSeen() {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const updateLastSeen = async () => {
      // Prevent concurrent updates
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;
      
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("user_id", user.id);
          
        if (error) {
          // Silently handle errors - profile might not exist yet
          console.debug("Could not update last_seen_at:", error.message);
        }
      } catch (error) {
        console.debug("Error updating last_seen_at:", error);
      } finally {
        isUpdatingRef.current = false;
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
