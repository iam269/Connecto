import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useComments, useAddComment } from "@/hooks/useComments";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";

type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

const CommentsSection = ({ postId, postOwnerId }: { postId: string; postOwnerId?: string }) => {
  const { data: comments, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment.mutate({ postId, content: newComment.trim(), postOwnerId });
    setNewComment("");
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments?.map((comment: CommentWithProfile) => (
            <div key={comment.id} className="flex gap-2">
              <Link to={`/profile/${comment.profiles?.username}`}>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {comment.profiles?.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <p className="text-sm">
                  <Link to={`/profile/${comment.profiles?.username}`} className="font-semibold">
                    {comment.profiles?.username}
                  </Link>{" "}
                  {comment.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm"
        />
        <Button type="submit" size="icon" variant="ghost" disabled={!newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default CommentsSection;
