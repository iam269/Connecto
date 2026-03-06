import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StoryWithProfile {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    last_seen_at: string | null;
  } | null;
  view_count?: number;
  is_viewed?: boolean;
}

export const useStories = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      // Get stories that haven't expired
      const now = new Date().toISOString();
      
      const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!stories || stories.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(stories.map((s) => s.user_id))];
      
      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .in("user_id", userIds);
      
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      // Get view counts and check if current user viewed
      const storyIds = stories.map((s) => s.id);
      const [viewsRes, userViewsRes] = await Promise.all([
        supabase
          .from("story_views")
          .select("story_id")
          .in("story_id", storyIds),
        user 
          ? supabase
              .from("story_views")
              .select("story_id")
              .eq("viewer_id", user.id)
              .in("story_id", storyIds)
          : Promise.resolve({ data: [] }),
      ]);

      const viewsMap: Record<string, number> = {};
      viewsRes.data?.forEach((v) => {
        viewsMap[v.story_id] = (viewsMap[v.story_id] || 0) + 1;
      });

      const viewedStoryIds = new Set(userViewsRes.data?.map((v) => v.story_id) || []);

      return stories.map((story) => ({
        ...story,
        profiles: profileMap.get(story.user_id) || null,
        view_count: viewsMap[story.id] || 0,
        is_viewed: viewedStoryIds.has(story.id),
      })) as StoryWithProfile[];
    },
  });
};

export const useUserStories = (userId?: string) => {
  const { user } = useAuth();
  const viewingUserId = userId || user?.id;

  return useQuery({
    queryKey: ["user-stories", viewingUserId],
    queryFn: async () => {
      if (!viewingUserId) return [];

      // Get stories for specific user that haven't expired
      const now = new Date().toISOString();
      
      const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", viewingUserId)
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!stories || stories.length === 0) return [];

      // Get profile for the user
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .eq("user_id", viewingUserId);
      
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      // Get view counts and check if current user viewed
      const storyIds = stories.map((s) => s.id);
      const [viewsRes, userViewsRes] = await Promise.all([
        supabase
          .from("story_views")
          .select("story_id")
          .in("story_id", storyIds),
        user 
          ? supabase
              .from("story_views")
              .select("story_id")
              .eq("viewer_id", user.id)
              .in("story_id", storyIds)
          : Promise.resolve({ data: [] }),
      ]);

      const viewsMap: Record<string, number> = {};
      viewsRes.data?.forEach((v) => {
        viewsMap[v.story_id] = (viewsMap[v.story_id] || 0) + 1;
      });

      const viewedStoryIds = new Set(userViewsRes.data?.map((v) => v.story_id) || []);

      return stories.map((story) => ({
        ...story,
        profiles: profileMap.get(story.user_id) || null,
        view_count: viewsMap[story.id] || 0,
        is_viewed: viewedStoryIds.has(story.id),
      })) as StoryWithProfile[];
    },
    enabled: !!viewingUserId,
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Stories expire after 24 hours
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useViewStory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) throw new Error("Not authenticated");

      // Check if already viewed
      const { data: existing } = await supabase
        .from("story_views")
        .select("*")
        .eq("story_id", storyId)
        .eq("viewer_id", user.id)
        .single();

      if (existing) return existing;

      const { data, error } = await supabase
        .from("story_views")
        .insert({
          story_id: storyId,
          viewer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};

export const useStoryViewers = (storyId: string) => {
  return useQuery({
    queryKey: ["story-viewers", storyId],
    queryFn: async () => {
      const { data: views, error } = await supabase
        .from("story_views")
        .select("viewer_id, viewed_at")
        .eq("story_id", storyId)
        .order("viewed_at", { ascending: false });

      if (error) throw error;
      if (!views || views.length === 0) return [];

      const viewerIds = [...new Set(views.map((v) => v.viewer_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, last_seen_at")
        .in("user_id", viewerIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));

      return views.map((view) => ({
        viewer_id: view.viewer_id,
        viewed_at: view.viewed_at,
        profile: profileMap.get(view.viewer_id) || null,
      }));
    },
    enabled: !!storyId,
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
};
