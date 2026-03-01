interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OnlineIndicator({ isOnline, size = "md", className = "" }: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2 border",
    md: "h-3 w-3 border-2",
    lg: "h-4 w-4 border-2",
  };

  if (!isOnline) return null;

  return (
    <span
      className={`absolute bottom-0 right-0 rounded-full border-background bg-green-500 ${sizeClasses[size]} ${className}`}
    />
  );
}

/**
 * Check if a user is considered online based on their last_seen_at timestamp.
 * A user is considered online if they were seen within the last 5 minutes.
 */
export function isUserOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const lastSeen = new Date(lastSeenAt);
  
  return lastSeen > fiveMinutesAgo;
}
