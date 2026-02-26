import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, Film, Volume2, VolumeX } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const Explore = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["explore-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const imagePosts = posts?.filter((p) => p.media_type !== "video" && p.image_url) || [];
  const videoPosts = posts?.filter((p) => p.media_type === "video" && p.video_url) || [];

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Explore</h1>
        </div>

        <Tabs defaultValue="photos">
          <TabsList className="w-full">
            <TabsTrigger value="photos" className="flex-1 gap-2">
              <Compass className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="reels" className="flex-1 gap-2">
              <Film className="h-4 w-4" />
              Reels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            {isLoading ? (
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-sm" />
                ))}
              </div>
            ) : imagePosts.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <p>Nothing to explore yet. Be the first to post!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {imagePosts.map((post) => (
                  <Card key={post.id} className="aspect-square overflow-hidden rounded-sm border-0">
                    <img src={post.image_url!} alt="" className="h-full w-full object-cover" />
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reels">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[9/16] w-full rounded-lg" />
                ))}
              </div>
            ) : videoPosts.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <p>No reels yet. Share a video!</p>
              </div>
            ) : (
              <div className="snap-y snap-mandatory space-y-2">
                {videoPosts.map((post) => (
                  <ReelCard key={post.id} videoUrl={post.video_url!} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const ReelCard = ({ videoUrl }: { videoUrl: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) videoRef.current?.play().catch(() => {});
        else videoRef.current?.pause();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative aspect-[9/16] w-full snap-start overflow-hidden rounded-lg bg-muted">
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        loop
        muted={muted}
        playsInline
      />
      <button
        onClick={() => setMuted(!muted)}
        className="absolute bottom-3 right-3 rounded-full bg-background/60 p-2"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default Explore;
