import Layout from "@/components/layout/Layout";
import { useProfile } from "@/hooks/useProfile";
import { useUserPosts, useSavedPosts, useLikedPosts, PostWithProfile } from "@/hooks/usePosts";
import { useFollowCounts } from "@/hooks/useFollows";
import { useAuth } from "@/contexts/AuthContext";
import { useFollowersList, useFollowingList, ConnectionProfile } from "@/hooks/useConnections";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Settings, Grid3X3, Bookmark, Heart, CalendarDays, MapPin, LinkIcon, Users, UserPlus, UserCheck } from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import Stories from "@/components/stories/Stories";
import type { Database } from "@/integrations/supabase/types";

const ConnectionCard = ({ profile }: { profile: ConnectionProfile }) => {
  return (
    <Link to={`/profile/${profile.username}`} className="block">
      <div className="text-center p-2 rounded-lg transition-colors hover:bg-accent/30">
        <Avatar className="h-16 w-16 mx-auto">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {profile.username?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-semibold mt-2 truncate">{profile.full_name || profile.username}</p>
        <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
      </div>
    </Link>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: posts } = useUserPosts(user?.id);
  const { data: savedPosts } = useSavedPosts();
  const { data: likedPosts } = useLikedPosts();
  const { data: counts } = useFollowCounts(user?.id);
  const { data: followers, isLoading: loadingFollowers } = useFollowersList();
  const { data: following, isLoading: loadingFollowing } = useFollowingList();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="flex items-center gap-6 px-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const profileData = profile as Database['public']['Tables']['profiles']['Row'] | null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cover Banner */}
        <div className="relative">
          <div className="h-40 rounded-xl bg-gradient-to-r from-primary/30 via-primary/20 to-accent overflow-hidden">
            {profileData?.cover_image_url && (
              <img src={profileData.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="absolute -bottom-12 left-6">
            <Avatar className="h-24 w-24 border-4 border-card">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                {profile?.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute top-3 right-3">
            <Link to="/settings">
              <Button variant="outline" size="icon" className="h-9 w-9 bg-card/80 backdrop-blur-sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-8 px-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{profile?.full_name || profile?.username}</h1>
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            </div>
            <Link to="/settings">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </Link>
          </div>

          {profile?.bio && <p className="mt-3 text-sm">{profile.bio}</p>}

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {profileData?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profileData.location}
              </span>
            )}
            {profileData?.website && (
              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <LinkIcon className="h-3.5 w-3.5" />
                {profileData.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined {new Date(profile?.created_at || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>

          {/* Stats Row */}
          <div className="mt-4 flex gap-6 text-sm">
            <Link to="/connections" className="hover:text-primary transition-colors">
              <span><strong>{posts?.length || 0}</strong> <span className="text-muted-foreground">Posts</span></span>
            </Link>
            <Link to="/connections" className="hover:text-primary transition-colors">
              <span><strong>{counts?.followers || 0}</strong> <span className="text-muted-foreground">Followers</span></span>
            </Link>
            <Link to="/connections" className="hover:text-primary transition-colors">
              <span><strong>{counts?.following || 0}</strong> <span className="text-muted-foreground">Following</span></span>
            </Link>
          </div>

          {/* Stories - Only show current user's stories */}
          {user?.id && <Stories userId={user.id} />}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1 gap-1.5">
              <Grid3X3 className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex-1 gap-1.5">
              <Bookmark className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex-1 gap-1.5">
              <Heart className="h-4 w-4" />
              Liked
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1 gap-1.5">
              <Users className="h-4 w-4" />
              Connections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 space-y-4">
            {posts?.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <p>No posts yet</p>
                <Link to="/create" className="mt-2 inline-block text-primary">
                  Create your first post
                </Link>
              </div>
            ) : (
              posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-4 space-y-4">
            {savedPosts?.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Bookmark className="mx-auto mb-2 h-8 w-8" />
                <p>No saved posts yet</p>
              </div>
            ) : (
              savedPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-4 space-y-4">
            {likedPosts?.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Heart className="mx-auto mb-2 h-8 w-8" />
                <p>No liked posts yet</p>
              </div>
            ) : (
              likedPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="connections" className="mt-4">
            <Tabs defaultValue="followers">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="followers" className="flex-1 gap-1.5">
                  <Users className="h-4 w-4" />
                  Followers
                </TabsTrigger>
                <TabsTrigger value="following" className="flex-1 gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="followers">
                {loadingFollowers ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                        <Skeleton className="h-3 w-20 mt-2 mx-auto" />
                        <Skeleton className="h-2 w-14 mt-1 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : followers?.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 h-8 w-8" />
                    <p>No followers yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {followers?.map((profile) => (
                      <ConnectionCard key={profile.user_id} profile={profile} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="following">
                {loadingFollowing ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                        <Skeleton className="h-3 w-20 mt-2 mx-auto" />
                        <Skeleton className="h-2 w-14 mt-1 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : following?.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <UserPlus className="mx-auto mb-2 h-8 w-8" />
                    <p>Not following anyone yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {following?.map((profile) => (
                      <ConnectionCard key={profile.user_id} profile={profile} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
