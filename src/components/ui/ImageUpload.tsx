import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, X, GripVertical, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
  existingUrls?: string[];
  aspectRatio?: "square" | "video" | "banner" | "auto";
  className?: string;
}

const ImageUpload = ({
  onUpload,
  maxFiles = 1,
  folder = "posts",
  existingUrls = [],
  aspectRatio = "auto",
  className = "",
}: ImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[3/1]",
    auto: "",
  }[aspectRatio];

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size < 500_000 || !file.type.startsWith("image/")) {
        resolve(file);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1920;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file);
          },
          "image/jpeg",
          0.85
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const remaining = maxFiles - uploadedUrls.length - previews.length;
      const selected = Array.from(files).slice(0, remaining);
      const newPreviews = selected.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setPreviews((p) => [...p, ...newPreviews]);
    },
    [maxFiles, uploadedUrls.length, previews.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removePreview = (index: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[index].url);
      return p.filter((_, i) => i !== index);
    });
  };

  const removeUploaded = (index: number) => {
    const updated = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(updated);
    onUpload(updated);
  };

  const uploadAll = async () => {
    if (!user || previews.length === 0) return;
    setUploading(true);
    setProgress(0);
    const newUrls: string[] = [];
    const total = previews.length;

    for (let i = 0; i < total; i++) {
      try {
        const compressed = await compressImage(previews[i].file);
        const ext = compressed.name.split(".").pop() || "jpg";
        const path = `${user.id}/${folder}/${Date.now()}_${i}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, compressed);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        toast({ title: "Upload failed", description: message, variant: "destructive" });
      }
      setProgress(((i + 1) / total) * 100);
    }

    const allUrls = [...uploadedUrls, ...newUrls];
    setUploadedUrls(allUrls);
    setPreviews([]);
    setProgress(0);
    setUploading(false);
    onUpload(allUrls);
    if (newUrls.length > 0) {
      toast({ title: `${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded!` });
    }
  };

  const totalCount = uploadedUrls.length + previews.length;
  const canAdd = totalCount < maxFiles;

  return (
    <div className={className}>
      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${aspectClass} ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/30"
          }`}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop or <span className="text-primary font-medium">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {maxFiles > 1 ? `Up to ${maxFiles} images` : "Select an image"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Previews grid */}
      {(uploadedUrls.length > 0 || previews.length > 0) && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {uploadedUrls.map((url, i) => (
            <div key={`uploaded-${i}`} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeUploaded(i)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {previews.map((p, i) => (
            <div key={`preview-${i}`} className="relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 ring-primary/30">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] text-primary-foreground">
                Pending
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress & button */}
      {previews.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploading && <Progress value={progress} className="h-1.5" />}
          <Button onClick={uploadAll} disabled={uploading} size="sm" className="w-full">
            <ImagePlus className="mr-2 h-4 w-4" />
            {uploading ? `Uploading... ${Math.round(progress)}%` : `Upload ${previews.length} image${previews.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
