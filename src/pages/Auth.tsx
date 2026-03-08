import { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import connectoLogo from "@/assets/connecto-logo.png";
import loginImage from "@/assets/login.avif";

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [confirmingEmail, setConfirmingEmail] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupUsername, setSignupUsername] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  // Handle email confirmation from URL hash
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if there's a hash in the URL (from Supabase email confirmation)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && refreshToken && (type === "signup" || type === "email_change" || type === "recovery")) {
        setConfirmingEmail(true);
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            toast({ 
              title: "Email confirmation failed", 
              description: error.message, 
              variant: "destructive" 
            });
          } else {
            toast({ 
              title: "Email verified!", 
              description: "Your account has been successfully verified." 
            });
            navigate("/");
          }
        } catch (error) {
          console.error("Email confirmation error:", error);
          toast({ 
            title: "Email confirmation failed", 
            description: "An unexpected error occurred. Please try again.", 
            variant: "destructive" 
          });
        } finally {
          setConfirmingEmail(false);
          // Clean up URL
          window.location.hash = "";
        }
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

  if (user) return <Navigate to="/" replace />;

  if (confirmingEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <img src={connectoLogo} alt="Connecto" className="mb-4 h-10" />
            <CardTitle className="text-2xl">Confirming your email</CardTitle>
            <CardDescription>Please wait while we verify your account...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({ title: "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, {
        username: signupUsername,
        full_name: signupFullName,
      });
      // User is automatically signed in after signup
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({ title: "Signup failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={loginImage}
          alt="Login"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex min-h-screen w-full lg:w-1/2 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <img src={connectoLogo} alt="Connecto" className="mb-4 h-10" />
            <CardTitle className="text-2xl">Welcome to Connecto</CardTitle>
            <CardDescription>Connect with friends and share your moments</CardDescription>
          </CardHeader>
          <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <div className="relative">
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
                <div className="relative">
                  <Input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Password (min 6 chars)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          </CardContent>
          
          {/* Footer with Privacy & Terms */}
          <div className="mt-4 border-t border-border pt-4 text-center text-xs text-muted-foreground">
            <p className="mb-2">By continuing, you agree to our</p>
            <div className="flex items-center justify-center gap-3">
              <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
              <span>·</span>
              <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </Card>
        </div>
    </div>
  );
};

export default Auth;

