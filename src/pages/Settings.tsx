import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Moon, Save, Trash2, AlertTriangle } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const Settings = () => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setCoverUrl(profile.cover_image_url || "");
      setLocation(profile.location || "");
      setWebsite(profile.website || "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        username: username.trim(),
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        cover_image_url: coverUrl.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
      } as ProfileUpdate);
      toast({ title: "Profile updated!" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update';
      toast({ title: "Failed to update", description: message, variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw new Error(response.error.message);

      toast({ title: "Account deleted", description: "Your account has been permanently deleted." });
      await signOut();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      toast({ title: "Failed to delete account", description: message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation("");
    }
  };

  return (
    <Layout title="Settings" subtitle="Customize your profile and preferences">
      <div className="space-y-6">
        {/* Profile Preview */}
        <Card>
          <CardContent className="p-0">
            <div className="relative h-32 rounded-t-lg bg-gradient-to-r from-primary/30 via-primary/20 to-accent overflow-hidden">
              {coverUrl && <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />}
            </div>
            <div className="px-4 pb-4">
              <div className="-mt-10 flex items-end gap-3">
                <Avatar className="h-20 w-20 border-4 border-card">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <p className="font-semibold">{fullName || username || "Your Name"}</p>
                  <p className="text-xs text-muted-foreground">@{username || "username"}</p>
                </div>
              </div>
              {bio && <p className="mt-2 text-sm text-muted-foreground">{bio}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Profile Picture</label>
              <ImageUpload onUpload={(urls) => urls[0] && setAvatarUrl(urls[0])} maxFiles={1} folder="avatars" existingUrls={avatarUrl ? [avatarUrl] : []} aspectRatio="square" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Cover Image</label>
              <ImageUpload onUpload={(urls) => urls[0] && setCoverUrl(urls[0])} maxFiles={1} folder="covers" existingUrls={coverUrl ? [coverUrl] : []} aspectRatio="banner" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Website</label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
            </div>
            <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="text-sm">Dark Mode</span>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button variant="destructive" onClick={signOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>This will permanently delete:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Your profile and personal data</li>
                <li>All your posts, comments, and likes</li>
                <li>Your messages and conversations</li>
                <li>Your followers and connections</li>
              </ul>
              <p className="font-medium pt-2">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="border-destructive/50 focus-visible:ring-destructive"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeleteConfirmation(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "DELETE" || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Settings;
