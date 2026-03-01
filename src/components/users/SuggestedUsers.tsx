import { useSuggestedUsers } from "@/hooks/useSuggestedUsers";
import { useToggleFollow, useIsFollowing } from "@/hooks/useFollows";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SuggestedUserItem = ({ profile }: { profile: { user_id: string; username: string | null; full_name: string | null; avatar_url: string | null; last_seen_at: string | null } }) => {
  const { data: isFollowing } = useIsFollowing(profile.user_id);
  const toggleFollow = useToggleFollow();

  return (
    <div className="flex items-center gap-3 py-2">
      <Link to={`/profile/${profile.username}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {profile.username?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${profile.username}`} className="text-sm font-semibold truncate block">{profile.username}</Link>
        <p className="text-xs text-muted-foreground truncate">{profile.full_name}</p>
      </div>
      <Button
        size="sm"
        variant={isFollowing ? "outline" : "default"}
        onClick={() => toggleFollow.mutate({ targetUserId: profile.user_id, isFollowing: !!isFollowing })}
        className="text-xs h-8"
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
};

const SuggestedUsers = () => {
  const { data: users, isLoading } = useSuggestedUsers(5);

  if (isLoading || !users?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Suggested for you</h3>
      {users.map((u) => (
        <SuggestedUserItem key={u.user_id} profile={u} />
      ))}
    </div>
  );
};

export default SuggestedUsers;
