import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSuggestedUsers = (limit = 5) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["suggested-users", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      // Get users the current user already follows
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      const followingIds = new Set(following?.map((f) => f.following_id) || []);
      followingIds.add(user.id);

      // Fetch all profiles, filter client-side
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const suggestions = (profiles || [])
        .filter((p) => !followingIds.has(p.user_id))
        .slice(0, limit);

      return suggestions;
    },
    enabled: !!user,
  });
};
