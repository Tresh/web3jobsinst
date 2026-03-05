import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { getPasswordStrength } from "@/components/auth/passwordStrength";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle both hash-based and query-based recovery links
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    const accessToken = hashParams.get("access_token");
    const hashType = hashParams.get("type");
    const tokenHash = queryParams.get("token_hash");
    const queryType = queryParams.get("type");
    const authCode = queryParams.get("code");

    const errorCode = hashParams.get("error_code") || queryParams.get("error_code");
    const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");

    // Handle error in URL (e.g., expired link)
    if (errorCode || errorDescription) {
      setIsValidSession(false);
      setErrorMessage(errorDescription?.replace(/\+/g, " ") || "The reset link is invalid or has expired.");
      return;
    }

    // Query-based recovery (token_hash flow)
    if (tokenHash && queryType === "recovery") {
      supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash }).then(({ error }) => {
        if (error) {
          setIsValidSession(false);
          setErrorMessage("This reset link is invalid or has expired. Please request a new one.");
        } else {
          setIsValidSession(true);
        }
      });
      return;
    }

    // Auth-code based recovery flow
    if (authCode) {
      supabase.auth.exchangeCodeForSession(authCode).then(({ error }) => {
        if (error) {
          setIsValidSession(false);
          setErrorMessage("Unable to verify reset link. Please request a new one.");
        } else {
          setIsValidSession(true);
        }
      });
      return;
    }

    // Hash-based recovery flow
    if (accessToken && hashType === "recovery") {
      setIsValidSession(true);
      return;
    }

    // Set up auth state listener to catch PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      } else if (event === "SIGNED_IN" && session) {
        // User might already be in a valid session from the recovery link
        setIsValidSession(true);
      }
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        setIsValidSession(false);
        setErrorMessage("Unable to verify your session. Please request a new reset link.");
        return;
      }
      
      if (session) {
        setIsValidSession(true);
      } else if (!accessToken && !tokenHash && !authCode) {
        // No session and no recovery token/code in URL
        setIsValidSession(false);
        setErrorMessage("No valid reset session found. Please request a new password reset link.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    const strength = getPasswordStrength(password);
    if (strength.score < 3) {
      toast({
        title: "Password too weak",
        description: "Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Password update error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    toast({
      title: "Password updated",
      description: "Your password has been successfully reset.",
    });
    
    // Sign out to clear the recovery session and redirect to login
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/login");
    }, 3000);
  };

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error state if session is invalid
  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/favicon.png" alt="Web3 Jobs Institute" className="w-10 h-10 object-contain" />
              <span className="font-bold text-xl text-foreground">Web3 Jobs Institute</span>
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
              <p className="text-muted-foreground mb-6">
                {errorMessage || "This password reset link has expired or is invalid."}
              </p>
              <Button asChild className="w-full">
                <Link to="/forgot-password">Request New Reset Link</Link>
              </Button>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/favicon.png" alt="Web3 Jobs Institute" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-foreground">Web3 Jobs Institute</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Password Reset</h1>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully updated. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
              <p className="text-muted-foreground text-center mb-8">
                Enter your new password below
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                  <PasswordStrengthMeter password={password} />
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
                    <Lock className="h-5 w-5 mr-2" />
                  )}
                  Update Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
