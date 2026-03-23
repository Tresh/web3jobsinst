import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, X, CheckCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const AUTH_REDIRECT_KEY = "auth_redirect_path";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSentDialog, setShowEmailSentDialog] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { signUpWithEmail, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const statePath = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
    const queryPath = searchParams.get("redirect");
    const storedPath = sessionStorage.getItem(AUTH_REDIRECT_KEY);
    const combinedStatePath = statePath?.pathname
      ? `${statePath.pathname}${statePath.search || ""}${statePath.hash || ""}`
      : null;

    const candidate = combinedStatePath || queryPath || storedPath || "/dashboard";
    return candidate.startsWith("/") ? candidate : "/dashboard";
  }, [location.state, searchParams]);

  useEffect(() => {
    sessionStorage.setItem(AUTH_REDIRECT_KEY, redirectPath);
  }, [redirectPath]);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      sessionStorage.setItem("referral_code", ref);
    }
  }, [searchParams]);

  useEffect(() => {
    if (referralCode.trim()) {
      sessionStorage.setItem("referral_code", referralCode.trim());
    } else {
      sessionStorage.removeItem("referral_code");
    }
  }, [referralCode]);

  useEffect(() => {
    if (passwordError && password === confirmPassword) {
      setPasswordError("");
    }
  }, [password, confirmPassword, passwordError]);

  useEffect(() => {
    if (emailError) {
      setEmailError("");
    }
  }, [email, emailError]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (user) {
    sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: submittedEmail,
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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setEmailError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUpWithEmail(
      email,
      password,
      fullName,
      referralCode.trim() || undefined,
      redirectPath,
    );

    if (error) {
      if (
        error.message.includes("already registered") ||
        error.message.includes("already exists") ||
        error.message.includes("User already registered")
      ) {
        setEmailError("An account with this email already exists. Please sign in instead.");
      } else {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      setSubmittedEmail(email);
      setShowEmailSentDialog(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
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
          <h1 className="text-2xl font-bold text-center mb-2">Create your account</h1>
          <p className="text-muted-foreground text-center mb-8">
            Join the Web3 Jobs Institute community
          </p>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`h-12 ${emailError ? "border-destructive" : ""}`}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`h-12 ${passwordError ? "border-destructive" : ""}`}
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
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
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to={`/login${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              state={{ from: { pathname: redirectPath } }}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={showEmailSentDialog} onOpenChange={setShowEmailSentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Check your email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a confirmation link to <strong>{submittedEmail}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Please click the link in the email to verify your account, then return here to log in.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                setShowEmailSentDialog(false);
                navigate(`/login${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`, {
                  state: { from: { pathname: redirectPath } },
                });
              }}
            >
              Go to Login
            </Button>
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder.
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
