import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Bell, Shield, ToggleLeft, Loader2 } from "lucide-react";
import { useFeatureFlags, FEATURE_FLAGS } from "@/hooks/useFeatureFlags";

const featureDescriptions: Record<string, { label: string; description: string }> = {
  institutions: { label: "Verified Institutions", description: "Institution portal applications and directory" },
  tutors: { label: "Become a Tutor", description: "Tutor application system" },
  talent_market: { label: "Talent Market", description: "Public talent directory and hiring" },
  internships: { label: "Internships", description: "Internship profiles and marketplace" },
  learnfi: { label: "LearnFi", description: "Learn-to-earn programs" },
  bootcamps: { label: "Bootcamps", description: "Bootcamp creation and participation" },
  products: { label: "Products", description: "Digital product marketplace" },
  campaigns: { label: "Campaigns", description: "Marketing campaigns directory" },
};

const AdminSettings = () => {
  const { toast } = useToast();
  const { flags, isLoading: flagsLoading, toggleFeature } = useFeatureFlags();
  const [settings, setSettings] = useState({
    siteName: "Web3 Jobs Institute",
    siteDescription: "Learn Web3 skills and get hired",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    enableAnalytics: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully",
    });
  };

  const handleToggleFeature = async (featureKey: string, enabled: boolean) => {
    const settingKey = FEATURE_FLAGS[featureKey as keyof typeof FEATURE_FLAGS];
    try {
      await toggleFeature.mutateAsync({ key: settingKey, enabled });
      toast({
        title: enabled ? "Feature enabled" : "Feature disabled",
        description: `${featureDescriptions[featureKey]?.label} is now ${enabled ? "live" : "showing Coming Soon"}`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure platform settings and preferences
        </p>
      </div>

      {/* Feature Toggles */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ToggleLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Feature Toggles</h2>
            <p className="text-sm text-muted-foreground">Enable or disable platform features. Disabled features show &quot;Coming Soon&quot;.</p>
          </div>
        </div>

        {flagsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(featureDescriptions).map(([key, { label, description }], index) => (
              <div key={key}>
                {index > 0 && <Separator className="mb-5" />}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={flags[key] !== false}
                    onCheckedChange={(checked) => handleToggleFeature(key, checked)}
                    disabled={toggleFeature.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">General Settings</h2>
            <p className="text-sm text-muted-foreground">Basic platform configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Security</h2>
            <p className="text-sm text-muted-foreground">Authentication and access control</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="registration">Allow Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to create accounts
              </p>
            </div>
            <Switch
              id="registration"
              checked={settings.allowRegistration}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowRegistration: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailVerification">Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Require email verification for new accounts
              </p>
            </div>
            <Switch
              id="emailVerification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireEmailVerification: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable the site for maintenance
              </p>
            </div>
            <Switch
              id="maintenance"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenanceMode: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">Email and push notification settings</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications to users
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableNotifications: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics">Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Collect anonymous usage analytics
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableAnalytics: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
