import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ImagePlus, Smile, MapPin, Camera } from "lucide-react";

const PostComposer = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    // Navigate to create page for full upload experience
    navigate("/create");
  };

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {profile?.username?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => navigate("/create")}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/50"
          >
            What's on your mind?
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="flex gap-1">
            <button
              onClick={handleFileClick}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <ImagePlus className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">Photo</span>
            </button>
            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <Camera className="h-5 w-5 text-accent-foreground" />
              <span className="hidden sm:inline">Camera</span>
            </button>
            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <Smile className="h-5 w-5 text-accent-foreground" />
              <span className="hidden sm:inline">Feeling</span>
            </button>
            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <MapPin className="h-5 w-5 text-destructive" />
              <span className="hidden sm:inline">Location</span>
            </button>
          </div>
          <Button size="sm" onClick={() => navigate("/create")}>
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostComposer;
