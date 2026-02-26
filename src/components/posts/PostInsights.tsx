import { usePostInsights } from "@/hooks/usePostInsights";
import { Eye, Heart, Bookmark, MessageCircle } from "lucide-react";

const PostInsights = ({ postId }: { postId: string }) => {
  const { data } = usePostInsights(postId);
  if (!data) return null;

  const stats = [
    { icon: Eye, label: "Views", value: data.views },
    { icon: Heart, label: "Likes", value: data.likes },
    { icon: Bookmark, label: "Saves", value: data.saves },
    { icon: MessageCircle, label: "Comments", value: data.comments },
  ];

  return (
    <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-muted/50 p-3">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-1">
          <s.icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-bold">{s.value}</span>
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PostInsights;
