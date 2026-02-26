import Layout from "@/components/layout/Layout";
import PostCard from "@/components/posts/PostCard";
import SuggestedUsers from "@/components/users/SuggestedUsers";
import PostComposer from "@/components/posts/PostComposer";
import Stories from "@/components/stories/Stories";
import { useFeedPosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { PlusSquare } from "lucide-react";

const Index = () => {
  const { data: posts, isLoading } = useFeedPosts();

  return (
    <Layout title="Home" subtitle="See what's happening in your network">
      <div className="space-y-4">
        {/* Stories */}
        <Stories />

        {/* Post composer */}
        <PostComposer />

        {/* Feed */}
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : !posts?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PlusSquare className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Welcome to Connecto!</h2>
              <p className="mt-2 text-muted-foreground">
                Follow people or create your first post to get started.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/discover"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Discover People
                </Link>
                <Link
                  to="/create"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
                >
                  Create Post
                </Link>
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}

          {/* Suggested users */}
          <SuggestedUsers />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
