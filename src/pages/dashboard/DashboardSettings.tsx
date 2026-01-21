import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Lock, Mail, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DashboardSettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [newEmail, setNewEmail] = useState("");

  const isWalletUser = user?.email?.includes("@wallet.local");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
      })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }

    setIsLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // First verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError("Current password is incorrect");
      setIsLoading(false);
      return;
    }

    // Now update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsLoading(false);
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Don't allow wallet.local emails
    if (newEmail.includes("@wallet.local")) {
      toast({
        title: "Invalid email",
        description: "Please use a real email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification email sent",
        description: "Please check your inbox to verify your new email.",
      });
      setNewEmail("");
    }

    setIsLoading(false);
  };

  // Get display initial
  const getInitial = () => {
    if (fullName) return fullName.charAt(0).toUpperCase();
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          {!isWalletUser && (
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
          )}
          {isWalletUser && (
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              Add Email
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and public profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar - Color background with initial */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {getInitial()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">
                      Your avatar shows the first letter of your name
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={isWalletUser ? "No email linked" : (user?.email || "")}
                      disabled
                      className="bg-secondary"
                    />
                    {isWalletUser && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Wallet className="w-3 h-3" />
                        Wallet User
                      </span>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab - Only for email users */}
        {!isWalletUser && (
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Add Email Tab (for wallet users) */}
        {isWalletUser && (
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Add Email Address
                </CardTitle>
                <CardDescription>
                  Add an email to receive notifications and enable email/password login
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Email Address</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      A verification link will be sent to this email address. After verification, you can use this email to log in.
                    </p>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Email
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DashboardSettings;