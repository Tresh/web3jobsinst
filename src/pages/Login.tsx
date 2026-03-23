import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AUTH_REDIRECT_KEY = "auth_redirect_path";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUnverifiedMessage, setShowUnverifiedMessage] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { signInWithEmail, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectPath = useMemo(() => {
    const statePath = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
    const queryPath = searchParams.get("redirect");
    const storedPath = sessionStorage.getItem(AUTH_REDIRECT_KEY);
    const metadataPath = typeof user?.user_metadata?.redirect_path === "string"
      ? user.user_metadata.redirect_path
      : null;
    const combinedStatePath = statePath?.pathname
      ? `${statePath.pathname}${statePath.search || ""}${statePath.hash || ""}`
      : null;

    const candidate = combinedStatePath || queryPath || storedPath || metadataPath || "/dashboard";
    return candidate.startsWith("/") ? candidate : "/dashboard";
  }, [location.state, searchParams, user?.user_metadata?.redirect_path]);

  useEffect(() => {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectPath);
  }, [redirectPath]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!user) return;

    const metadataPath = typeof user.user_metadata?.redirect_path === "string"
      ? user.user_metadata.redirect_path
      : null;

    sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    if (metadataPath) {
      void supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          redirect_path: null,
        },
      });
    }
    navigate(redirectPath, { replace: true });
  }, [navigate, redirectPath, user]);

  if (user) {
    return null;
  }

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0 || isResending || !email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (error) {
        toast({
          title: "Failed to resend",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email sent!",
          description: "A new confirmation email has been sent.",
        });
        setResendCooldown(60);
      }
    } catch {
      toast({
        title: "Failed to resend",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
    setIsResending(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowUnverifiedMessage(false);

    const { error } = await signInWithEmail(email, password);

    if (error) {
      if (error.message.includes("Email not confirmed") || error.message.includes("email not confirmed")) {
        setShowUnverifiedMessage(true);
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      const {
        data: { user: signedInUser },
      } = await supabase.auth.getUser();
      const metadataPath = typeof signedInUser?.user_metadata?.redirect_path === "string"
        ? signedInUser.user_metadata.redirect_path
        : null;
      const nextPath = metadataPath?.startsWith("/") ? metadataPath : redirectPath;

      sessionStorage.removeItem(AUTH_REDIRECT_KEY);
      if (metadataPath) {
        void supabase.auth.updateUser({
          data: {
            ...signedInUser?.user_metadata,
            redirect_path: null,
          },
        });
      }
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate(nextPath, { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/favicon.png" alt="Web3 Jobs Institute" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-foreground">Web3 Jobs Institute</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Mail className="h-5 w-5 mr-2" />
              )}
              Sign in
            </Button>
          </form>

          {showUnverifiedMessage && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-center space-y-2">
              <p className="text-sm text-foreground">
                Your email is not verified yet. Please check your inbox.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendConfirmation}
                disabled={isResending || resendCooldown > 0}
                className="text-primary"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation email"}
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
            <Link to="/forgot-password" className="text-primary hover:underline font-medium block">
              Forgot your password?
            </Link>
            <p>
              Don't have an account?{" "}
              <Link
                to={`/signup${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                state={{ from: { pathname: redirectPath } }}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
