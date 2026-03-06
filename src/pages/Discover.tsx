import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToggleFollow, useIsFollowing } from "@/hooks/useFollows";
import { Link } from "react-router-dom";
import { Search, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ["discover-users", searchQuery],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").neq("user_id", user?.id || "");
      if (searchQuery.trim()) {
        query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground">Searching...</p>
          ) : users?.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No users found</p>
          ) : (
            users?.map((profile) => (
              <UserItem key={profile.id} profile={profile} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const UserItem = ({ profile }: { profile: Profile }) => {
  const { data: isFollowing } = useIsFollowing(profile.user_id);
  const toggleFollow = useToggleFollow();

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <Link to={`/profile/${profile.username}`} className="flex flex-1 items-center gap-3">
          <Avatar>
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {profile.username?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{profile.username}</p>
            <p className="text-xs text-muted-foreground">{profile.full_name}</p>
          </div>
        </Link>
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          onClick={() => toggleFollow.mutate({ targetUserId: profile.user_id, isFollowing: !!isFollowing })}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Discover;
