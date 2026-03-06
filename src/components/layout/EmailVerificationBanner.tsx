import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user || user.email_confirmed_at) return null;

  const handleResend = async () => {
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email! });
    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verification email sent!" });
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
      <Mail className="h-5 w-5 text-primary shrink-0" />
      <span className="flex-1">Please verify your email to post and message.</span>
      <Button size="sm" variant="outline" onClick={handleResend} className="shrink-0">
        Resend
      </Button>
    </div>
  );
};

export default EmailVerificationBanner;
