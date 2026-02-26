import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatePost } from "@/hooks/usePosts";
import { useCreateStory } from "@/hooks/useStories";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Video, Image } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import VideoUpload from "@/components/ui/VideoUpload";
import { Input } from "@/components/ui/input";

const Create = () => {
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [activeTab, setActiveTab] = useState<"post" | "story">("post");
  const createPost = useCreatePost();
  const createStory = useCreateStory();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check if user came from clicking add story button
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "story") {
      setActiveTab("story");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "story") {
      // Create story
      if (imageUrls.length === 0) {
        toast({ title: "Please select an image", variant: "destructive" });
        return;
      }
      
      try {
        await createStory.mutateAsync(imageUrls[0]);
        toast({ title: "Story created!" });
        navigate("/");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        toast({ title: "Failed to create story", description: message, variant: "destructive" });
      }
      return;
    }
    
    // Create post
    const hasMedia = mediaType === "image" ? imageUrls.length > 0 : videoUrl.trim();
    if (!content.trim() && !hasMedia) return;

    try {
      await createPost.mutateAsync({
        content: content.trim() || undefined,
        image_url: mediaType === "image" ? (imageUrls[0] || undefined) : undefined,
        video_url: mediaType === "video" ? (videoUrl.trim() || undefined) : undefined,
        media_type: mediaType,
      });
      toast({ title: "Post created!" });
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Failed to create post", description: message, variant: "destructive" });
    }
  };

  return (
    <Layout title="Create">
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "post" | "story")}>
            <TabsList className="w-full">
              <TabsTrigger value="post" className="flex-1 gap-2">
                <ImagePlus className="h-4 w-4" />
                Post
              </TabsTrigger>
              <TabsTrigger value="story" className="flex-1 gap-2">
                <Image className="h-4 w-4" />
                Story
              </TabsTrigger>
            </TabsList>

            <TabsContent value="post">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />

                <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as "image" | "video")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="image" className="flex-1 gap-2">
                      <ImagePlus className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex-1 gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="space-y-2">
                    <ImageUpload
                      onUpload={setImageUrls}
                      maxFiles={10}
                      folder="posts"
                      existingUrls={imageUrls}
                    />
                  </TabsContent>

                  <TabsContent value="video" className="space-y-2">
                    <VideoUpload
                      onUpload={setVideoUrl}
                      folder="posts"
                      existingUrl={videoUrl}
                    />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or use URL
                        </span>
                      </div>
                    </div>
                    <Input
                      placeholder="https://example.com/video.mp4"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    {videoUrl && videoUrl.startsWith('http') && !videoUrl.includes('blob:') && (
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        <video src={videoUrl} controls className="h-full w-full object-cover" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPost.isPending}>
                    {createPost.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="story">
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Stories expire after 24 hours. Add a captivating image!
                </p>
                
                <ImageUpload
                  onUpload={setImageUrls}
                  maxFiles={1}
                  folder="stories"
                  existingUrls={imageUrls}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createStory.isPending}>
                    {createStory.isPending ? "Posting..." : "Share Story"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Create;
