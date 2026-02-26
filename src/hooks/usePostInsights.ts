import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePostInsights = (postId?: string) => {
  return useQuery({
    queryKey: ["post-insights", postId],
    queryFn: async () => {
      if (!postId) return { views: 0, likes: 0, saves: 0, comments: 0 };
      const [viewsRes, likesRes, savesRes, commentsRes] = await Promise.all([
        supabase.from("post_views").select("id", { count: "exact", head: true }).eq("post_id", postId),
        supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", postId),
        supabase.from("saved_posts").select("id", { count: "exact", head: true }).eq("post_id", postId),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("post_id", postId),
      ]);
      return {
        views: viewsRes.count || 0,
        likes: likesRes.count || 0,
        saves: savesRes.count || 0,
        comments: commentsRes.count || 0,
      };
    },
    enabled: !!postId,
  });
};
