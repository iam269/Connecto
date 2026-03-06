import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useComments = (postId?: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data: comments, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set(comments?.map((c) => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return (comments || []).map((c) => ({
        ...c,
        profiles: profileMap.get(c.user_id) || null,
      }));
    },
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, postOwnerId }: { postId: string; content: string; postOwnerId?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("comments")
        .insert({ post_id: postId, user_id: user.id, content })
        .select()
        .single();
      if (error) throw error;
      // Send notification
      if (postOwnerId && postOwnerId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: postOwnerId,
          actor_id: user.id,
          type: "comment",
          post_id: postId,
          comment_id: data.id,
        });
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });
};
