import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PostWithProfile {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  media_type: string;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    last_seen_at: string | null;
  } | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
}

export const useFeedPosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["feed-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: followings } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      const followingIds = followings?.map((f) => f.following_id) || [];
      followingIds.push(user.id);

      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .in("user_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set(posts?.map((p) => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      const postIds = posts?.map((p) => p.id) || [];
      const [likesRes, savesRes, likesCountRes, commentsCountRes] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("saved_posts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("likes").select("post_id").in("post_id", postIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
      ]);

      const likedPostIds = new Set(likesRes.data?.map((l) => l.post_id));
      const savedPostIds = new Set(savesRes.data?.map((s) => s.post_id));
      const likesMap: Record<string, number> = {};
      const commentsMap: Record<string, number> = {};
      likesCountRes.data?.forEach((l) => { likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1; });
      commentsCountRes.data?.forEach((c) => { commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1; });

      return (posts || []).map((post) => ({
        ...post,
        profiles: profileMap.get(post.user_id) || null,
        likes_count: likesMap[post.id] || 0,
        comments_count: commentsMap[post.id] || 0,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      })) as PostWithProfile[];
    },
    enabled: !!user,
  });
};

export const useUserPosts = (userId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [] as PostWithProfile[];

      // Get profile for the user
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .eq("user_id", userId)
        .single();

      const postIds = data.map((p) => p.id);
      const [likesRes, savesRes, likesCountRes, commentsCountRes] = await Promise.all([
        user ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds) : Promise.resolve({ data: [] }),
        user ? supabase.from("saved_posts").select("post_id").eq("user_id", user.id).in("post_id", postIds) : Promise.resolve({ data: [] }),
        supabase.from("likes").select("post_id").in("post_id", postIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
      ]);

      const likedPostIds = new Set(likesRes.data?.map((l) => l.post_id));
      const savedPostIds = new Set(savesRes.data?.map((s) => s.post_id));
      const likesMap: Record<string, number> = {};
      const commentsMap: Record<string, number> = {};
      likesCountRes.data?.forEach((l) => { likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1; });
      commentsCountRes.data?.forEach((c) => { commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1; });

      return data.map((post) => ({
        ...post,
        profiles: profile,
        likes_count: likesMap[post.id] || 0,
        comments_count: commentsMap[post.id] || 0,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      })) as PostWithProfile[];
    },
    enabled: !!userId,
  });
};

export const useSavedPosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-posts"],
    queryFn: async () => {
      if (!user) return [] as PostWithProfile[];

      const { data: saved, error: savedError } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", user.id);

      if (savedError) throw savedError;
      if (!saved || saved.length === 0) return [] as PostWithProfile[];

      const postIds = saved.map((s) => s.post_id);
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!posts || posts.length === 0) return [] as PostWithProfile[];

      const userIds = [...new Set(posts.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      const [likesRes, savesRes, likesCountRes, commentsCountRes] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("saved_posts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("likes").select("post_id").in("post_id", postIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
      ]);

      const likedPostIds = new Set(likesRes.data?.map((l) => l.post_id));
      const savedPostIds = new Set(savesRes.data?.map((s) => s.post_id));
      const likesMap: Record<string, number> = {};
      const commentsMap: Record<string, number> = {};
      likesCountRes.data?.forEach((l) => { likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1; });
      commentsCountRes.data?.forEach((c) => { commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1; });

      return posts.map((post) => ({
        ...post,
        profiles: profileMap.get(post.user_id) || null,
        likes_count: likesMap[post.id] || 0,
        comments_count: commentsMap[post.id] || 0,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      })) as PostWithProfile[];
    },
    enabled: !!user,
  });
};

export const useLikedPosts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["liked-posts"],
    queryFn: async () => {
      if (!user) return [] as PostWithProfile[];

      const { data: liked, error: likedError } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id);

      if (likedError) throw likedError;
      if (!liked || liked.length === 0) return [] as PostWithProfile[];

      const postIds = liked.map((l) => l.post_id);
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!posts || posts.length === 0) return [] as PostWithProfile[];

      const userIds = [...new Set(posts.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      const [likesRes, savesRes, likesCountRes, commentsCountRes] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("saved_posts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("likes").select("post_id").in("post_id", postIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
      ]);

      const likedPostIds = new Set(likesRes.data?.map((l) => l.post_id));
      const savedPostIds = new Set(savesRes.data?.map((s) => s.post_id));
      const likesMap: Record<string, number> = {};
      const commentsMap: Record<string, number> = {};
      likesCountRes.data?.forEach((l) => { likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1; });
      commentsCountRes.data?.forEach((c) => { commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1; });

      return posts.map((post) => ({
        ...post,
        profiles: profileMap.get(post.user_id) || null,
        likes_count: likesMap[post.id] || 0,
        comments_count: commentsMap[post.id] || 0,
        is_liked: likedPostIds.has(post.id),
        is_saved: savedPostIds.has(post.id),
      })) as PostWithProfile[];
    },
    enabled: !!user,
  });
};

export const useCreatePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image_url, video_url, media_type }: { content?: string; image_url?: string; video_url?: string; media_type?: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (!user.email_confirmed_at) throw new Error("Please verify your email first");
      const { data, error } = await supabase
        .from("posts")
        .insert({ user_id: user.id, content, image_url, video_url, media_type: media_type || "image" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
    },
  });
};

export const useToggleLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked, postOwnerId }: { postId: string; isLiked: boolean; postOwnerId?: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (isLiked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
      } else {
        await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
        // Send notification
        if (postOwnerId && postOwnerId !== user.id) {
          await supabase.from("notifications").insert({
            user_id: postOwnerId,
            actor_id: user.id,
            type: "like",
            post_id: postId,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-posts"] });
    },
  });
};

export const useToggleSave = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isSaved) {
        await supabase.from("saved_posts").delete().eq("user_id", user.id).eq("post_id", postId);
      } else {
        await supabase.from("saved_posts").insert({ user_id: user.id, post_id: postId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });
};
