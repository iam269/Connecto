import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useProfileByUsername } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/usePosts";
import { useFollowCounts, useIsFollowing, useToggleFollow } from "@/hooks/useFollows";
import { useGetOrCreateConversation } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid3X3, MessageCircle, CalendarDays, MapPin, Link as LinkIcon } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfileByUsername(username);
  const { data: posts } = useUserPosts(profile?.user_id);
  const { data: counts } = useFollowCounts(profile?.user_id);
  const { data: isFollowing } = useIsFollowing(profile?.user_id);
  const toggleFollow = useToggleFollow();
  const getOrCreateConversation = useGetOrCreateConversation();

  if (profile && user && profile.user_id === user.id) {
    return <Navigate to="/profile" replace />;
  }

  const handleMessage = async () => {
    if (!profile) return;
    await getOrCreateConversation.mutateAsync(profile.user_id);
    navigate(`/messages/${profile.user_id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="py-20 text-center text-muted-foreground">User not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cover Banner */}
        <div className="relative">
          <div className="h-40 rounded-xl bg-gradient-to-r from-primary/30 via-primary/20 to-accent overflow-hidden">
            {profile.cover_image_url && (
              <img src={profile.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="absolute -bottom-12 left-6">
            <Avatar className="h-20 w-20 border-4 border-card">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {profile.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-8 px-2">
          <div>
            <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <LinkIcon className="h-3.5 w-3.5" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined {new Date(profile.created_at || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>

          {/* Stats Row */}
          <div className="mt-4 flex gap-6 text-sm">
            <span><strong>{posts?.length || 0}</strong> <span className="text-muted-foreground">Posts</span></span>
            <span><strong>{counts?.followers || 0}</strong> <span className="text-muted-foreground">Followers</span></span>
            <span><strong>{counts?.following || 0}</strong> <span className="text-muted-foreground">Following</span></span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => toggleFollow.mutate({ targetUserId: profile.user_id, isFollowing: !!isFollowing })}
              variant={isFollowing ? "outline" : "default"}
              size="sm"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleMessage}>
              <MessageCircle className="mr-1 h-4 w-4" />
              Message
            </Button>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
            <Grid3X3 className="h-4 w-4" />
            POSTS
          </div>
          {posts?.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No posts yet</div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts?.map((post) => (
                <Card key={post.id} className="aspect-square overflow-hidden rounded-sm border-0">
                  {post.video_url ? (
                    <video src={post.video_url} className="h-full w-full object-cover" muted />
                  ) : post.image_url ? (
                    <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted p-2">
                      <p className="text-xs text-muted-foreground line-clamp-3">{post.content}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
