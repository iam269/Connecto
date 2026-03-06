import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Share2, Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useComments, useAddComment } from "@/hooks/useComments";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
};

const CommentsSection = ({ postId, postOwnerId }: { postId: string; postOwnerId?: string }) => {
  const { data: comments, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentWithProfile | null>(null);
  const [copied, setCopied] = useState(false);

  const getCommentUrl = (commentId: string) => `${window.location.origin}/post/${postId}#comment-${commentId}`;

  const sharePlatforms = [
    { name: "Facebook", icon: Facebook, color: "bg-blue-600 hover:bg-blue-700", url: (url: string, text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "X (Twitter)", icon: Twitter, color: "bg-black hover:bg-gray-800", url: (url: string, text: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { name: "WhatsApp", icon: ({ className }: { className?: string }) => <div className={`flex items-center justify-center w-5 h-5 text-white font-bold text-xs ${className || ''}`}>WA</div>, color: "bg-green-500 hover:bg-green-600", url: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
    { name: "LinkedIn", icon: Linkedin, color: "bg-blue-700 hover:bg-blue-800", url: (url: string, text: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  const handleShare = (comment: CommentWithProfile) => {
    setSelectedComment(comment);
    setShareDialogOpen(true);
    setCopied(false);
  };

  const handlePlatformShare = (platform: typeof sharePlatforms[0]) => {
    if (!selectedComment) return;
    const url = getCommentUrl(selectedComment.id);
    const text = `${selectedComment.profiles?.username}: ${selectedComment.content}`;
    const shareUrl = platform.url(url, text);
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    if (!selectedComment) return;
    const url = getCommentUrl(selectedComment.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

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
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  <button
                    onClick={() => handleShare(comment)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Comment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {sharePlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handlePlatformShare(platform)}
                className={`flex flex-col items-center gap-2 rounded-lg p-4 ${platform.color} text-white transition-transform hover:scale-105`}
              >
                <platform.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{platform.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={selectedComment ? getCommentUrl(selectedComment.id) : ""}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={handleCopyLink}
              variant={copied ? "default" : "outline"}
              className="min-w-[80px]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentsSection;
