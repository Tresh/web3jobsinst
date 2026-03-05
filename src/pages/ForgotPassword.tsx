import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface ResetAttemptState {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const STORAGE_KEY = "password_reset_attempts";

const getResetState = (): ResetAttemptState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { count: 0, lastAttempt: 0, lockedUntil: null };
};

const saveResetState = (state: ResetAttemptState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const getWaitTime = (attemptCount: number): number => {
  // 30 sec for first, then 1 min increments, then 24 hrs after 6 attempts
  if (attemptCount === 0) return 0;
  if (attemptCount >= 6) return 24 * 60 * 60; // 24 hours in seconds
  if (attemptCount === 1) return 30; // 30 seconds
  return 60 * attemptCount; // 1 min, 2 min, 3 min, etc.
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is currently rate limited
    const state = getResetState();
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      const remainingSeconds = Math.ceil((state.lockedUntil - Date.now()) / 1000);
      setCountdown(remainingSeconds);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Reset attempts after 24 hour lockout expires
            const state = getResetState();
            if (state.count >= 6) {
              saveResetState({ count: 0, lastAttempt: 0, lockedUntil: null });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const formatCountdown = (seconds: number): string => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    }
    return `${seconds}s`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    const state = getResetState();
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const resetRedirectUrl = new URL("/reset-password", window.location.origin).toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirectUrl,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setIsSubmitted(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    }

    // Update rate limit state
    const newCount = state.count + 1;
    const waitSeconds = getWaitTime(newCount);
    const newState: ResetAttemptState = {
      count: newCount,
      lastAttempt: Date.now(),
      lockedUntil: Date.now() + waitSeconds * 1000,
    };
    saveResetState(newState);
    setCountdown(waitSeconds);

    setIsLoading(false);
  };

  const handleTryAgain = () => {
    const state = getResetState();
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      const remainingSeconds = Math.ceil((state.lockedUntil - Date.now()) / 1000);
      setCountdown(remainingSeconds);
      toast({
        title: "Please wait",
        description: `You can try again in ${formatCountdown(remainingSeconds)}`,
        variant: "destructive",
      });
      return;
    }
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={logo} alt="Web3 Jobs Institute" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-foreground">Web3 Jobs Institute</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8">
          {!isSubmitted ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">Forgot password?</h1>
              <p className="text-muted-foreground text-center mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={countdown > 0}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading || countdown > 0}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : countdown > 0 ? (
                    `Wait ${formatCountdown(countdown)}`
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email?{" "}
                <button
                  onClick={handleTryAgain}
                  className="text-primary hover:underline font-medium"
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Wait ${formatCountdown(countdown)}` : "Try again"}
                </button>
              </p>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;