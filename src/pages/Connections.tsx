import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useFollowersList, useFollowingList, useMutualConnections, ConnectionProfile } from "@/hooks/useConnections";
import { useToggleFollow, useIsFollowing } from "@/hooks/useFollows";
import { useSuggestedUsers } from "@/hooks/useSuggestedUsers";
import { Link } from "react-router-dom";
import { Users, UserPlus, UserCheck, Handshake } from "lucide-react";

const ConnectionCard = ({ profile }: { profile: ConnectionProfile }) => {
  const { data: isFollowing } = useIsFollowing(profile.user_id);
  const toggleFollow = useToggleFollow();

  return (
    <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent/30">
      <Link to={`/profile/${profile.username}`}>
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {profile.username?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${profile.username}`}>
          <p className="text-sm font-semibold truncate">{profile.full_name || profile.username}</p>
          <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
        </Link>
        {profile.bio && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{profile.bio}</p>}
      </div>
      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={() =>
          toggleFollow.mutate({ targetUserId: profile.user_id, isFollowing: !!isFollowing })
        }
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
};

const ConnectionsList = ({ profiles, emptyText }: { profiles?: ConnectionProfile[]; emptyText: string }) => {
  if (!profiles) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {profiles.map((p) => (
        <ConnectionCard key={p.user_id} profile={p} />
      ))}
    </div>
  );
};

const Connections = () => {
  const { data: followers, isLoading: loadingFollowers } = useFollowersList();
  const { data: following, isLoading: loadingFollowing } = useFollowingList();
  const { data: mutuals, isLoading: loadingMutuals } = useMutualConnections();
  const { data: suggested } = useSuggestedUsers();

  return (
    <Layout title="Connections" subtitle="Manage your network">
      <div className="space-y-6">
        <Tabs defaultValue="followers">
          <TabsList className="w-full">
            <TabsTrigger value="followers" className="flex-1 gap-1.5">
              <Users className="h-4 w-4" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1 gap-1.5">
              <UserPlus className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="mutual" className="flex-1 gap-1.5">
              <Handshake className="h-4 w-4" />
              Mutual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            <Card>
              <CardContent className="p-2">
                <ConnectionsList
                  profiles={loadingFollowers ? undefined : followers}
                  emptyText="No followers yet"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following">
            <Card>
              <CardContent className="p-2">
                <ConnectionsList
                  profiles={loadingFollowing ? undefined : following}
                  emptyText="Not following anyone yet"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mutual">
            <Card>
              <CardContent className="p-2">
                <ConnectionsList
                  profiles={loadingMutuals ? undefined : mutuals}
                  emptyText="No mutual connections yet"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Suggested connections */}
        {suggested && suggested.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Suggested for you
              </h3>
              <div className="divide-y divide-border">
                {suggested.map((p) => (
                  <ConnectionCard
                    key={p.user_id}
                    profile={{
                      user_id: p.user_id,
                      username: p.username,
                      full_name: p.full_name,
                      avatar_url: p.avatar_url,
                      bio: null,
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Connections;
