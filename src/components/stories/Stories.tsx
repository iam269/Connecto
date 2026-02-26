import { useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStories, StoryWithProfile } from "@/hooks/useStories";
import { useAuth } from "@/contexts/AuthContext";
import StoryViewer from "./StoryViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const Stories = () => {
  const { data: stories, isLoading } = useStories();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Group stories by user
  const storiesByUser = stories?.reduce((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = [];
    }
    acc[story.user_id].push(story);
    return acc;
  }, {} as Record<string, StoryWithProfile[]>);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    setViewerOpen(true);
  };

  const handleCloseViewer = (open: boolean) => {
    setViewerOpen(open);
    if (!open) {
      setSelectedStoryIndex(null);
    }
  };

  // Flatten stories with user index
  const flattenedStories = Object.entries(storiesByUser || {}).flatMap(
    ([userId, userStories], userIndex) =>
      userStories.map((story, storyIndex) => ({
        ...story,
        userIndex,
        storyIndex,
      }))
  );

  const isOwner = user?.id === flattenedStories[selectedStoryIndex || 0]?.user_id;

  // Check if user has their own story
  const userHasStory = stories?.some(s => s.user_id === user?.id);

  if (isLoading) {
    return (
      <div className="flex gap-3 p-4 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-3 w-14 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
        {/* Add Story button for current user */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <Button
            variant={userHasStory ? "ghost" : "outline"}
            size="icon"
            className={`h-14 w-14 rounded-full ${userHasStory ? 'p-0' : 'border-2 border-dashed border-muted-foreground/50 hover:border-primary hover:bg-accent'}`}
            onClick={() => navigate("/create?type=story")}
          >
            {userHasStory ? (
              <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500">
                <Avatar className="h-12 w-12 border-2 border-background relative">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback>
                    {user?.email?.[0]?.toUpperCase() || "+"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Plus className="h-3 w-3" />
                </div>
              </div>
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
          <span className="text-xs text-muted-foreground">{userHasStory ? 'Story' : 'Adaugă'}</span>
        </div>

        {/* Stories */}
        {flattenedStories.map((story) => (
          <button
            key={story.id}
            onClick={() => handleStoryClick(story.userIndex)}
            className="flex-shrink-0 flex flex-col items-center gap-1 group"
          >
            <div className={`relative rounded-full p-[2px] ${story.is_viewed ? 'bg-muted' : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500'}`}>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500 blur-[2px] ${story.is_viewed ? 'opacity-50' : 'opacity-100'}`} />
              <Avatar className="h-12 w-12 border-2 border-background relative">
                <AvatarImage src={story.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {story.profiles?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {story.is_viewed && (
                <div className="absolute inset-0 rounded-full bg-black/30" />
              )}
            </div>
            <span className="text-xs text-muted-foreground max-w-[56px] truncate">
              {story.profiles?.username || story.profiles?.full_name || "User"}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={flattenedStories.map(s => ({
            id: s.id,
            user_id: s.user_id,
            image_url: s.image_url,
            created_at: s.created_at,
            expires_at: s.expires_at,
            profiles: s.profiles,
            view_count: s.view_count,
            is_viewed: s.is_viewed,
          }))}
          initialIndex={selectedStoryIndex}
          open={viewerOpen}
          onOpenChange={handleCloseViewer}
          isOwner={isOwner}
        />
      )}
    </>
  );
};

export default Stories;
