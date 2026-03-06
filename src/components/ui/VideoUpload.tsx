import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Video, X, Upload, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  existingUrl?: string;
  className?: string;
}

const VideoUpload = ({
  onUpload,
  folder = "posts",
  existingUrl,
  className = "",
}: VideoUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview({ file, url });
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const removePreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  };

  const removeUploaded = () => {
    setUploadedUrl(null);
    onUpload("");
  };

  const uploadVideo = async () => {
    if (!user || !preview) return;
    setUploading(true);
    setProgress(0);

    try {
      const ext = preview.file.name.split(".").pop() || "mp4";
      const path = `${user.id}/${folder}/${Date.now()}_video.${ext}`;

      // Upload the video file
      const { error } = await supabase.storage.from("media").upload(path, preview.file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      
      setUploadedUrl(urlData.publicUrl);
      onUpload(urlData.publicUrl);
      setPreview(null);
      setProgress(100);
      
      toast({ title: "Video uploaded successfully!" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const hasVideo = uploadedUrl || preview;

  return (
    <div className={className}>
      {/* Drop zone - only show if no video yet */}
      {!hasVideo && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragLeave={() => {}}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-accent/30"
        >
          <Video className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or <span className="text-primary font-medium">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Select a video from your device (max 100MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {/* Video preview */}
      {preview && (
        <div className="relative overflow-hidden rounded-lg bg-muted">
          <video
            src={preview.url}
            controls
            className="aspect-video w-full object-contain"
          />
          <button
            onClick={removePreview}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-2 rounded bg-primary/80 px-2 py-1 text-xs text-primary-foreground">
            Pending upload
          </div>
        </div>
      )}

      {/* Uploaded video */}
      {uploadedUrl && !preview && (
        <div className="relative overflow-hidden rounded-lg bg-muted">
          <video
            src={uploadedUrl}
            controls
            className="aspect-video w-full object-contain"
          />
          <button
            onClick={removeUploaded}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {preview && (
        <div className="mt-3 space-y-2">
          {uploading && <Progress value={progress} className="h-1.5" />}
          <Button
            onClick={uploadVideo}
            disabled={uploading}
            size="sm"
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? `Uploading... ${Math.round(progress)}%` : "Upload Video"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
