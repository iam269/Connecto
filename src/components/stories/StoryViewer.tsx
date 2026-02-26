import { useState, useEffect, useCallback } from "react";
import { X, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoryWithProfile, useViewStory, useStoryViewers, useDeleteStory } from "@/hooks/useStories";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoryViewerProps {
  stories: StoryWithProfile[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner?: boolean;
}

const StoryViewer = ({ stories, initialIndex, open, onOpenChange, isOwner }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showViewers, setShowViewers] = useState(false);
  const { user } = useAuth();
  const viewStory = useViewStory();
  const deleteStory = useDeleteStory();
  
  const currentStory = stories[currentIndex];
  const { data: viewers } = useStoryViewers(currentStory?.id || "");
  
  const goToNextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowViewers(false);
    } else {
      onOpenChange(false);
    }
  }, [currentIndex, stories.length, onOpenChange]);

  const goToPrevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowViewers(false);
    }
  }, [currentIndex]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && user && open) {
      viewStory.mutate(currentStory.id);
    }
  }, [currentStory, user, open, viewStory]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNextStory();
      if (e.key === "ArrowLeft") goToPrevStory();
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToNextStory, goToPrevStory, onOpenChange]);

  // Auto-advance after 60 seconds (1 minute)
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      goToNextStory();
    }, 60000); // 60 seconds = 1 minute

    return () => clearTimeout(timer);
  }, [currentIndex, open, goToNextStory]);

  if (!currentStory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-0">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
          {stories.map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? "50%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Story content */}
        <div className="relative max-h-[90vh] flex items-center justify-center bg-black">
          <img
            src={currentStory.image_url}
            alt="Story"
            className="w-full h-full max-h-[90vh] object-contain"
          />

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarImage src={currentStory.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {currentStory.profiles?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium text-sm">
                {currentStory.profiles?.username || currentStory.profiles?.full_name || "User"}
              </span>
              <span className="text-white/60 text-xs">
                {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Delete button - only for owner */}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-red-500/20 h-8 w-8"
                  onClick={async () => {
                    if (window.confirm("Sigur vrei să ștergi acest story?")) {
                      try {
                        await deleteStory.mutateAsync(currentStory.id);
                        if (currentIndex < stories.length - 1) {
                          setCurrentIndex(currentIndex);
                        } else if (currentIndex > 0) {
                          setCurrentIndex(currentIndex - 1);
                        } else {
                          onOpenChange(false);
                        }
                      } catch (error) {
                        console.error("Failed to delete story:", error);
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {/* Viewers button */}
              {isOwner && (
                <DropdownMenu open={showViewers} onOpenChange={setShowViewers}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
                    <div className="px-2 py-1.5 text-sm font-semibold">
                      Spectatori ({viewers?.length || 0})
                    </div>
                    {viewers && viewers.length > 0 ? (
                      viewers.map((viewer) => (
                        <DropdownMenuItem key={viewer.viewer_id} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={viewer.profile?.avatar_url || ""} />
                              <AvatarFallback className="text-xs">
                                {viewer.profile?.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {viewer.profile?.username || viewer.profile?.full_name || "User"}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                        Nu sunt spectatori încă
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Exit button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation areas */}
          <div
            className="absolute top-12 bottom-0 left-0 w-1/4 cursor-pointer"
            onClick={goToPrevStory}
          />
          <div
            className="absolute top-12 bottom-0 right-0 w-1/4 cursor-pointer"
            onClick={goToNextStory}
          />

          {/* Navigation arrows (mobile) */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevStory}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={goToNextStory}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
