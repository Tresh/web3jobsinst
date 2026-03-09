import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Briefcase, Save, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SKILL_CATEGORIES = [
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "design", label: "UI/UX Design" },
  { value: "marketing", label: "Digital Marketing" },
  { value: "content_creation", label: "Content Creation" },
  { value: "data_science", label: "Data Science" },
  { value: "blockchain", label: "Blockchain / Web3" },
  { value: "video_editing", label: "Video Editing" },
  { value: "community_management", label: "Community Management" },
  { value: "project_management", label: "Project Management" },
  { value: "general", label: "General" },
];

const TOOLS_OPTIONS = [
  "Figma", "Canva", "React", "Next.js", "Node.js", "Python", "Solidity",
  "Photoshop", "Premiere Pro", "CapCut", "WordPress", "Webflow",
  "Google Analytics", "Meta Ads", "Twitter/X", "Telegram", "Discord",
  "Notion", "GitHub", "VS Code", "ChatGPT", "Midjourney",
];

interface InternProfile {
  id: string;
  full_name: string;
  email: string;
  telegram_username: string | null;
  twitter_handle: string | null;
  portfolio_link: string | null;
  profile_photo_url: string | null;
  primary_skill_category: string;
  skill_level: string;
  tools_known: string[];
  experience_description: string | null;
  paid_preference: string;
  hours_per_week: string;
  work_mode: string;
  open_to_immediate: boolean;
  is_public: boolean;
  is_approved: boolean;
  internship_status: string;
}

const DashboardInternship = () => {
  const { user, profile: authProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<InternProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const [form, setForm] = useState({
    full_name: authProfile?.full_name || "",
    email: authProfile?.email || user?.email || "",
    telegram_username: "",
    twitter_handle: "",
    portfolio_link: "",
    primary_skill_category: "general",
    selected_skills: ["general"] as string[],
    skill_level: "beginner",
    tools_known: [] as string[],
    experience_description: "",
    paid_preference: "both",
    hours_per_week: "10-20",
    work_mode: "remote",
    open_to_immediate: true,
    is_public: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("internship_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const p = data as unknown as InternProfile;
        setProfile(p);
        const skills = p.primary_skill_category ? p.primary_skill_category.split(",").map(s => s.trim()) : ["general"];
        setForm({
          full_name: p.full_name,
          email: p.email,
          telegram_username: p.telegram_username || "",
          twitter_handle: p.twitter_handle || "",
          portfolio_link: p.portfolio_link || "",
          primary_skill_category: p.primary_skill_category,
          selected_skills: skills,
          skill_level: p.skill_level,
          tools_known: p.tools_known || [],
          experience_description: p.experience_description || "",
          paid_preference: p.paid_preference,
          hours_per_week: p.hours_per_week,
          work_mode: p.work_mode,
          open_to_immediate: p.open_to_immediate,
          is_public: p.is_public,
        });
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user]);

  const toggleTool = (tool: string) => {
    setForm((prev) => ({
      ...prev,
      tools_known: prev.tools_known.includes(tool)
        ? prev.tools_known.filter((t) => t !== tool)
        : [...prev.tools_known, tool],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      user_id: user.id,
      full_name: form.full_name,
      email: form.email,
      telegram_username: form.telegram_username || null,
      twitter_handle: form.twitter_handle || null,
      portfolio_link: form.portfolio_link || null,
      primary_skill_category: form.selected_skills.join(", "),
      skill_level: form.skill_level,
      tools_known: form.tools_known,
      experience_description: form.experience_description || null,
      paid_preference: form.paid_preference,
      hours_per_week: form.hours_per_week,
      work_mode: form.work_mode,
      open_to_immediate: form.open_to_immediate,
      is_public: form.is_public,
    };

    const { error } = profile
      ? await supabase.from("internship_profiles").update(payload).eq("id", profile.id)
      : await supabase.from("internship_profiles").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: profile ? "Profile updated" : "Profile created" });
      const { data } = await supabase
        .from("internship_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile(data as unknown as InternProfile);
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Internship Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          {profile ? "Manage your internship profile" : "Create your internship profile to appear on the market"}
        </p>
      </div>

      {/* Status Banner */}
      {profile && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {profile.is_approved ? "Your profile is approved" : "Pending admin approval"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile.is_public && profile.is_approved
                    ? "Visible on the Internship Market"
                    : profile.is_public
                    ? "Will be visible once approved"
                    : "Set Public Profile to ON to appear on the market"}
                </p>
              </div>
            </div>
            <Badge variant={profile.is_approved ? "default" : "secondary"}>
              {profile.is_approved ? "Approved" : "Pending"}
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {profile ? "Edit Profile" : "Create Profile"}
          </CardTitle>
          <CardDescription>
            Fill in your details to be listed on the internship marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Identity */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telegram</Label>
                <Input value={form.telegram_username} onChange={(e) => setForm({ ...form, telegram_username: e.target.value })} placeholder="@username" />
              </div>
              <div className="space-y-2">
                <Label>X (Twitter)</Label>
                <Input value={form.twitter_handle} onChange={(e) => setForm({ ...form, twitter_handle: e.target.value })} placeholder="@handle" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Portfolio Link</Label>
                <Input value={form.portfolio_link} onChange={(e) => setForm({ ...form, portfolio_link: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Skills (select multiple)</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_CATEGORIES.map((c) => (
                    <Badge
                      key={c.value}
                      variant={form.selected_skills.includes(c.value) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          selected_skills: prev.selected_skills.includes(c.value)
                            ? prev.selected_skills.filter((s) => s !== c.value)
                            : [...prev.selected_skills, c.value],
                        }));
                      }}
                    >
                      {form.selected_skills.includes(c.value) && <CheckCircle className="w-3 h-3 mr-1" />}
                      {c.label}
                    </Badge>
                  ))}
                  {form.selected_skills
                    .filter((s) => !SKILL_CATEGORIES.some((c) => c.value === s))
                    .map((custom) => (
                      <Badge
                        key={custom}
                        variant="default"
                        className="cursor-pointer transition-colors"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            selected_skills: prev.selected_skills.filter((s) => s !== custom),
                          }));
                        }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {custom}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add custom skill..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = customSkillInput.trim();
                        if (val && !form.selected_skills.includes(val)) {
                          setForm((prev) => ({ ...prev, selected_skills: [...prev.selected_skills, val] }));
                          setCustomSkillInput("");
                        }
                      }
                    }}
                    className="max-w-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const val = customSkillInput.trim();
                      if (val && !form.selected_skills.includes(val)) {
                        setForm((prev) => ({ ...prev, selected_skills: [...prev.selected_skills, val] }));
                        setCustomSkillInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skill Level</Label>
                <Select value={form.skill_level} onValueChange={(v) => setForm({ ...form, skill_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Tools Known</Label>
              <div className="flex flex-wrap gap-2">
                {TOOLS_OPTIONS.map((tool) => (
                  <Badge
                    key={tool}
                    variant={form.tools_known.includes(tool) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTool(tool)}
                  >
                    {form.tools_known.includes(tool) && <CheckCircle className="w-3 h-3 mr-1" />}
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Experience Description</Label>
              <Textarea
                value={form.experience_description}
                onChange={(e) => setForm({ ...form, experience_description: e.target.value })}
                placeholder="Briefly describe your skills and experience..."
                rows={3}
              />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paid / Unpaid</Label>
                <Select value={form.paid_preference} onValueChange={(v) => setForm({ ...form, paid_preference: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid Only</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hours Per Week</Label>
                <Select value={form.hours_per_week} onValueChange={(v) => setForm({ ...form, hours_per_week: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-10">5-10 hours</SelectItem>
                    <SelectItem value="10-20">10-20 hours</SelectItem>
                    <SelectItem value="20-30">20-30 hours</SelectItem>
                    <SelectItem value="30+">30+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Mode</Label>
                <Select value={form.work_mode} onValueChange={(v) => setForm({ ...form, work_mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.open_to_immediate}
                  onCheckedChange={(v) => setForm({ ...form, open_to_immediate: v })}
                />
                <Label>Open to immediate internship</Label>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
            <div>
              <p className="font-medium text-foreground text-sm">Public Profile</p>
              <p className="text-xs text-muted-foreground">
                When ON, your profile will appear on the public Internship Market (after admin approval)
              </p>
            </div>
            <Switch
              checked={form.is_public}
              onCheckedChange={(v) => setForm({ ...form, is_public: v })}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {profile ? "Update Profile" : "Create Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardInternship;
