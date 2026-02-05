import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useTalentProfile, TALENT_CATEGORIES } from "@/hooks/useTalentProfile";
import { Loader2, Plus, X, ExternalLink, Trash2, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DashboardTalent = () => {
  const { profile: userProfile } = useAuth();
  const { profile, loading, saving, saveProfile, deleteProfile } = useTalentProfile();

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("developer");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [availability, setAvailability] = useState<"available" | "busy">("available");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialGithub, setSocialGithub] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setCategory(profile.category || "developer");
      setSkills(profile.skills || []);
      setPortfolioLinks(profile.portfolio_links || []);
      setHourlyRate(profile.hourly_rate?.toString() || "");
      setAvailability(profile.availability || "available");
      setSocialTwitter(profile.social_twitter || "");
      setSocialLinkedin(profile.social_linkedin || "");
      setSocialGithub(profile.social_github || "");
      setIsPublished(profile.is_published ?? true);
    }
  }, [profile]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddLink = () => {
    if (newLink.trim() && !portfolioLinks.includes(newLink.trim())) {
      setPortfolioLinks([...portfolioLinks, newLink.trim()]);
      setNewLink("");
    }
  };

  const handleRemoveLink = (link: string) => {
    setPortfolioLinks(portfolioLinks.filter((l) => l !== link));
  };

  const handleSave = async () => {
    await saveProfile({
      headline,
      bio,
      category,
      skills,
      portfolio_links: portfolioLinks,
      hourly_rate: hourlyRate ? parseInt(hourlyRate) : null,
      availability,
      social_twitter: socialTwitter || null,
      social_linkedin: socialLinkedin || null,
      social_github: socialGithub || null,
      is_published: isPublished,
    });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your talent profile? This cannot be undone.")) {
      await deleteProfile();
    }
  };

  const initials = userProfile?.full_name
    ? userProfile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Talent Profile</h1>
            <p className="text-muted-foreground mt-1">
              {profile 
                ? "Manage your talent profile visible on the marketplace"
                : "Create your talent profile to get discovered by clients"
              }
            </p>
          </div>
          {profile && (
            <Badge 
              variant={isPublished ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {isPublished ? "Live" : "Hidden"}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Preview</CardTitle>
            <CardDescription>
              This is how you'll appear on the Talent Marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={userProfile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{userProfile?.full_name || "Your Name"}</h3>
                <p className="text-muted-foreground">{headline || "Your headline"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {TALENT_CATEGORIES.find((c) => c.value === category)?.label || category}
                  </Badge>
                  <span className={`text-xs flex items-center gap-1 ${availability === "available" ? "text-green-500" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${availability === "available" ? "bg-green-500" : "bg-muted-foreground"}`} />
                    {availability === "available" ? "Available" : "Busy"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline *</Label>
              <Input
                id="headline"
                placeholder="e.g., Smart Contract Developer | DeFi Specialist"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell clients about your experience, expertise, and what you can help them with..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TALENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={availability} onValueChange={(v) => setAvailability(v as "available" | "busy")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available for Work</SelectItem>
                    <SelectItem value="busy">Currently Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="e.g., 100"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
            <CardDescription>Add your key skills and expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Solidity, React, DeFi"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Links</CardTitle>
            <CardDescription>Showcase your best work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://your-project.com"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
              />
              <Button type="button" variant="outline" onClick={handleAddLink}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {portfolioLinks.map((link) => (
                <div key={link} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm truncate hover:underline flex-1"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {portfolioLinks.length === 0 && (
                <p className="text-sm text-muted-foreground">No portfolio links added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Socials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Links</CardTitle>
            <CardDescription>Connect your professional profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="@username"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={socialLinkedin}
                onChange={(e) => setSocialLinkedin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                placeholder="https://github.com/username"
                value={socialGithub}
                onChange={(e) => setSocialGithub(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Published</p>
                <p className="text-sm text-muted-foreground">
                  When enabled, your profile is visible on the Talent Marketplace
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          {profile && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Profile
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={handleSave} disabled={saving || !headline}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {profile ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTalent;
