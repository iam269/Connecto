import Layout from "@/components/layout/Layout";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Heart, MessageCircle, UserPlus, AtSign, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

type NotificationType = "like" | "comment" | "follow" | "mention" | "message";

interface ActorProfile {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Notification {
  id: string;
  actor_id: string;
  user_id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  actor_profile: ActorProfile | null;
}

const typeIcon: Record<NotificationType, LucideIcon> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  message: MessageCircle,
};

const typeText: Record<string, string> = {
  like: "liked your post",
  comment: "commented on your post",
  follow: "started following you",
  mention: "mentioned you",
  message: "sent you a message",
};

const Notifications = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const navigate = useNavigate();

  useEffect(() => {
    markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Notifications</h1>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))
        ) : notifications?.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications?.map((notif) => {
              const Icon = typeIcon[notif.type] || Heart;
              const isMessage = notif.type === "message";
              return (
                <Card 
                  key={notif.id} 
                  className={!notif.is_read ? "bg-accent/50" : ""}
                  onClick={() => {
                    if (isMessage) {
                      navigate(`/messages/${notif.actor_id}`);
                    }
                  }}
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <Link to={`/profile/${notif.actor_profile?.username}`}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notif.actor_profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {notif.actor_profile?.username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm">
                        <Link to={`/profile/${notif.actor_profile?.username}`} className="font-semibold">
                          {notif.actor_profile?.username}
                        </Link>{" "}
                        {typeText[notif.type] || notif.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
