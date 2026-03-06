import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ConnectionProfile {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export const useFollowersList = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["followers-list", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: follows } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", user.id);
      if (!follows?.length) return [];
      const ids = follows.map((f) => f.follower_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, bio")
        .in("user_id", ids);
      return (profiles || []) as ConnectionProfile[];
    },
    enabled: !!user,
  });
};

export const useFollowingList = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["following-list", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      if (!follows?.length) return [];
      const ids = follows.map((f) => f.following_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, bio")
        .in("user_id", ids);
      return (profiles || []) as ConnectionProfile[];
    },
    enabled: !!user,
  });
};

export const useMutualConnections = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mutual-connections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const [{ data: followers }, { data: following }] = await Promise.all([
        supabase.from("follows").select("follower_id").eq("following_id", user.id),
        supabase.from("follows").select("following_id").eq("follower_id", user.id),
      ]);
      const followerIds = new Set(followers?.map((f) => f.follower_id) || []);
      const mutualIds = (following || [])
        .map((f) => f.following_id)
        .filter((id) => followerIds.has(id));
      if (!mutualIds.length) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, bio")
        .in("user_id", mutualIds);
      return (profiles || []) as ConnectionProfile[];
    },
    enabled: !!user,
  });
};
