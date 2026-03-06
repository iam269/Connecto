import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useRecordView = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) return;
      await supabase.from("post_views").insert({ post_id: postId, viewer_id: user.id });
    },
  });
};

export const useViewCount = (postId?: string) => {
  return useQuery({
    queryKey: ["post-view-count", postId],
    queryFn: async () => {
      if (!postId) return 0;
      const { count } = await supabase
        .from("post_views")
        .select("id", { count: "exact", head: true })
        .eq("post_id", postId);
      return count || 0;
    },
    enabled: !!postId,
  });
};
