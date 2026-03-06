import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Volume2, VolumeX, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PostWithProfile, useToggleLike, useToggleSave, useDeletePost } from "@/hooks/usePosts";
import { useRecordView } from "@/hooks/usePostViews";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CommentsSection from "./CommentsSection";
import PostInsights from "./PostInsights";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const PostCard = ({ post }: { post: PostWithProfile }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const deletePost = useDeletePost();
  const recordView = useRecordView();
  const [showComments, setShowComments] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRecorded = useRef(false);

  const isOwner = user?.id === post.user_id;
  const isVideo = post.media_type === "video" && post.video_url;

  // Intersection Observer for autoplay + view tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          if (!viewRecorded.current && user) {
            viewRecorded.current = true;
            recordView.mutate(post.id);
          }
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id, user, recordView]);

  const handleDoubleTap = () => {
    if (post.is_liked) return;
    toggleLike.mutate({ postId: post.id, isLiked: false, postOwnerId: post.user_id });
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  return (
    <Card className="overflow-hidden border-border transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${post.profiles?.username}`} className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {post.profiles?.username?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{post.profiles?.full_name || post.profiles?.username || "unknown"}</p>
            <p className="text-xs text-muted-foreground">@{post.profiles?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deletePost.mutate(post.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content text above media */}
      {post.content && (
        <div className="px-4 pb-2">
          <p className="text-sm">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {(isVideo || post.image_url) && (
        <div
          ref={containerRef}
          className="relative w-full bg-muted"
          onDoubleClick={handleDoubleTap}
        >
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={post.video_url!}
                className="w-full object-cover"
                loop
                muted={muted}
                playsInline
              />
              <button
                onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                className="absolute bottom-3 right-3 rounded-full bg-background/60 p-2"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </>
          ) : post.image_url ? (
            <img src={post.image_url} alt="Post" className="w-full object-cover" />
          ) : null}

          {/* Heart animation overlay */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="h-20 w-20 fill-destructive text-destructive animate-ping" />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleLike.mutate({ postId: post.id, isLiked: post.is_liked, postOwnerId: post.user_id })}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-all active:scale-110 hover:bg-accent/50"
            >
              <Heart
                className={`h-5 w-5 ${post.is_liked ? "fill-destructive text-destructive" : "text-foreground/70"}`}
              />
              {post.likes_count > 0 && <span className="text-xs font-medium">{post.likes_count}</span>}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-all hover:bg-accent/50"
            >
              <MessageCircle className="h-5 w-5 text-foreground/70" />
              {post.comments_count > 0 && <span className="text-xs font-medium">{post.comments_count}</span>}
            </button>
            <button
              onClick={() => {
                const postUrl = `${window.location.origin}/post/${post.id}`;
                navigator.clipboard.writeText(postUrl).then(() => {
                  toast({ title: "Link copied to clipboard!" });
                }).catch(() => {
                  toast({ title: "Failed to copy link", variant: "destructive" });
                });
              }}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-all hover:bg-accent/50"
            >
              <Share2 className="h-5 w-5 text-foreground/70" />
            </button>
            {isOwner && (
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-all hover:bg-accent/50"
              >
                <BarChart3 className="h-5 w-5 text-foreground/70" />
              </button>
            )}
          </div>
          <button
            onClick={() => toggleSave.mutate({ postId: post.id, isSaved: post.is_saved })}
            className="rounded-lg px-2 py-1.5 transition-all hover:bg-accent/50"
          >
            <Bookmark
              className={`h-5 w-5 ${post.is_saved ? "fill-foreground text-foreground" : "text-foreground/70"}`}
            />
          </button>
        </div>

        {/* Comments count */}
        {post.comments_count > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="mt-1 text-sm text-muted-foreground"
          >
            View all {post.comments_count} comments
          </button>
        )}

        {/* Insights */}
        {showInsights && isOwner && <PostInsights postId={post.id} />}

        {/* Comments */}
        {showComments && <CommentsSection postId={post.id} postOwnerId={post.user_id} />}
      </CardContent>
    </Card>
  );
};

export default PostCard;
