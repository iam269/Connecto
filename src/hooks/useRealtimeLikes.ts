import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to enable real-time updates for likes on posts
 * This will automatically refresh the feed when likes change
 */
export function useRealtimeLikes() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to likes table changes
    const likesChannel = supabase
      .channel("likes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
        },
        (payload) => {
          console.log("Like change received!", payload);
          
          // Invalidate all post-related queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
          queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
          queryClient.invalidateQueries({ queryKey: ["user-posts"] });
          queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
          queryClient.invalidateQueries({ queryKey: ["liked-posts"] });
        }
      )
      .subscribe();

    // Also listen for posts changes (for new posts)
    const postsChannel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        () => {
          console.log("New post received!");
          queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
          queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [queryClient]);
}
