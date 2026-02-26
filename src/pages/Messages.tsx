import Layout from "@/components/layout/Layout";
import { useConversations } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";

const Messages = () => {
  const { data: conversations, isLoading } = useConversations();

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Messages</h1>

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))
        ) : conversations?.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <MessageCircle className="mx-auto mb-4 h-12 w-12" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation from someone's profile</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations?.map((conv: any) => (
              <Link key={conv.id} to={`/messages/${conv.otherUser?.user_id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center gap-3 p-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.otherUser?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.otherUser?.username?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm">{conv.otherUser?.username}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
