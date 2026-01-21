import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2, ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REQUIRED_ACCOUNTS = [
  { id: "web3jobsinc", label: "@web3jobsinc", url: "https://x.com/web3jobsinc" },
  { id: "web3righteous", label: "@web3righteous", url: "https://x.com/web3righteous" },
  { id: "hostweb3hub", label: "@hostweb3hub", url: "https://x.com/hostweb3hub" },
];

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35+"];

const MAIN_GOALS = [
  "Get a remote job",
  "Learn high-income skills",
  "Become a creator",
  "Trade / invest",
  "Build products",
  "Freelance",
  "Start a business",
  "I'm still figuring it out",
];

const HOURS_OPTIONS = ["1–3 hrs", "4–6 hrs", "7–10 hrs", "10+ hrs"];

const TRACKS = [
  "Content Creation",
  "Growth & Marketing",
  "Community Management",
  "Research & Analytics",
  "Trading",
  "Development",
  "AI & Automation",
  "Project Management",
  "Sales",
  "Still exploring",
];

const MONEY_OPTIONS = ["Yes", "No", "A little"];

const Scholarship = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [program, setProgram] = useState<any>(null);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    // Section 1
    full_name: "",
    email: "",
    telegram_username: "",
    twitter_handle: "",
    country: "",
    age_range: "",
    // Section 2
    followed_accounts: [] as string[],
    retweet_link: "",
    tag_tweet_link: "",
    // Section 3
    why_scholarship: "",
    main_goal: "",
    hours_per_week: "",
    // Section 4
    preferred_track: "",
    made_money_online: "",
    how_made_money: "",
    // Section 5
    willing_public_twitter: false,
    willing_public_ranking: false,
    // Section 6
    understands_performance_based: false,
    understands_credit_unlock: false,
    agrees_community_rules: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/scholarship/${programId}` } } });
      return;
    }

    const fetchProgram = async () => {
      const { data } = await supabase
        .from("scholarship_programs")
        .select("*")
        .eq("id", programId)
        .eq("is_active", true)
        .single();

      if (!data) {
        toast({
          title: "Program not found",
          description: "This scholarship program is not available.",
          variant: "destructive",
        });
        navigate("/dashboard/scholarship");
        return;
      }

      // Check if already applied
      const { data: existingApp } = await supabase
        .from("scholarship_applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("program_id", programId)
        .single();

      if (existingApp) {
        toast({
          title: "Already applied",
          description: "You have already applied to this program.",
        });
        navigate("/dashboard/scholarship");
        return;
      }

      setProgram(data);
      setFormData((prev) => ({
        ...prev,
        email: user.email?.includes("@wallet.local") ? "" : (user.email || ""),
      }));
      setIsLoading(false);
    };

    fetchProgram();
  }, [user, programId, navigate, toast]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFollowedAccount = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      followed_accounts: prev.followed_accounts.includes(id)
        ? prev.followed_accounts.filter((a) => a !== id)
        : [...prev.followed_accounts, id],
    }));
  };

  const validateStep = (step: number): boolean => {
    setError("");
    switch (step) {
      case 1:
        if (!formData.full_name || !formData.email || !formData.telegram_username || 
            !formData.twitter_handle || !formData.country || !formData.age_range) {
          setError("Please fill in all required fields");
          return false;
        }
        break;
      case 2:
        if (formData.followed_accounts.length !== REQUIRED_ACCOUNTS.length) {
          setError("Please confirm you've followed all required accounts");
          return false;
        }
        if (!formData.retweet_link || !formData.tag_tweet_link) {
          setError("Please provide all required tweet links");
          return false;
        }
        break;
      case 3:
        if (!formData.why_scholarship || !formData.main_goal || !formData.hours_per_week) {
          setError("Please answer all questions");
          return false;
        }
        break;
      case 4:
        if (!formData.preferred_track || !formData.made_money_online) {
          setError("Please select your track and answer the question");
          return false;
        }
        break;
      case 5:
        if (!formData.willing_public_twitter) {
          setError("This scholarship requires public participation on Twitter/X");
          return false;
        }
        if (!formData.willing_public_ranking) {
          setError("This scholarship requires participation in public rankings");
          return false;
        }
        break;
      case 6:
        if (!formData.understands_performance_based || !formData.understands_credit_unlock || 
            !formData.agrees_community_rules) {
          setError("Please agree to all terms to continue");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);

    const { error: submitError } = await supabase
      .from("scholarship_applications")
      .insert({
        user_id: user!.id,
        program_id: programId,
        ...formData,
        followed_accounts: formData.followed_accounts,
      });

    if (submitError) {
      toast({
        title: "Submission failed",
        description: submitError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      navigate("/dashboard/scholarship");
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{program?.title}</h1>
            <p className="text-muted-foreground">{program?.description}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-10 h-2 rounded-full transition-colors ${
                  step <= currentStep ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram Username *</Label>
                  <Input
                    value={formData.telegram_username}
                    onChange={(e) => updateField("telegram_username", e.target.value)}
                    placeholder="@yourusername"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter/X Handle *</Label>
                  <Input
                    value={formData.twitter_handle}
                    onChange={(e) => updateField("twitter_handle", e.target.value)}
                    placeholder="@yourhandle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="Your country"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age Range *</Label>
                  <Select value={formData.age_range} onValueChange={(v) => updateField("age_range", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((age) => (
                        <SelectItem key={age} value={age}>{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Entry Requirements */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Entry Requirements</CardTitle>
                <CardDescription>
                  Complete these tasks to qualify. Applications without proof will be rejected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Follow all required accounts *</Label>
                  {REQUIRED_ACCOUNTS.map((account) => (
                    <div key={account.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={account.id}
                        checked={formData.followed_accounts.includes(account.id)}
                        onCheckedChange={() => toggleFollowedAccount(account.id)}
                      />
                      <label htmlFor={account.id} className="text-sm flex-1 cursor-pointer">
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {account.label}
                        </a>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Link to your retweet of the scholarship post *</Label>
                  <Input
                    value={formData.retweet_link}
                    onChange={(e) => updateField("retweet_link", e.target.value)}
                    placeholder="https://x.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link to your tweet tagging 2 friends *</Label>
                  <Input
                    value={formData.tag_tweet_link}
                    onChange={(e) => updateField("tag_tweet_link", e.target.value)}
                    placeholder="https://x.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Intent */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
                <CardDescription>Help us understand your motivation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Why do you want this scholarship? *</Label>
                  <Textarea
                    value={formData.why_scholarship}
                    onChange={(e) => updateField("why_scholarship", e.target.value)}
                    placeholder="Tell us your story..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>What is your main goal in Web3? *</Label>
                  <Select value={formData.main_goal} onValueChange={(v) => updateField("main_goal", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_GOALS.map((goal) => (
                        <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hours per week you can commit *</Label>
                  <Select value={formData.hours_per_week} onValueChange={(v) => updateField("hours_per_week", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hours" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS_OPTIONS.map((hours) => (
                        <SelectItem key={hours} value={hours}>{hours}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Track Selection */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Skill Track</CardTitle>
                <CardDescription>Choose your learning path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Preferred track *</Label>
                  <Select value={formData.preferred_track} onValueChange={(v) => updateField("preferred_track", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRACKS.map((track) => (
                        <SelectItem key={track} value={track}>{track}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Have you made money online before? *</Label>
                  <RadioGroup
                    value={formData.made_money_online}
                    onValueChange={(v) => updateField("made_money_online", v)}
                  >
                    {MONEY_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                {(formData.made_money_online === "Yes" || formData.made_money_online === "A little") && (
                  <div className="space-y-2">
                    <Label>How did you make money online?</Label>
                    <Textarea
                      value={formData.how_made_money}
                      onChange={(e) => updateField("how_made_money", e.target.value)}
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Proof of Work */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Commitment Check</CardTitle>
                <CardDescription>This scholarship requires public participation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="willing_twitter"
                    checked={formData.willing_public_twitter}
                    onCheckedChange={(checked) => updateField("willing_public_twitter", !!checked)}
                  />
                  <div>
                    <label htmlFor="willing_twitter" className="text-sm font-medium cursor-pointer">
                      I'm willing to participate publicly on Twitter/X
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Daily tasks and proof-of-work will be shared publicly
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="willing_ranking"
                    checked={formData.willing_public_ranking}
                    onCheckedChange={(checked) => updateField("willing_public_ranking", !!checked)}
                  />
                  <div>
                    <label htmlFor="willing_ranking" className="text-sm font-medium cursor-pointer">
                      I'm willing to be ranked publicly
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Submit tasks, participate in challenges, and be ranked with other scholars
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Agreement */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Agreement & Commitment</CardTitle>
                <CardDescription>Please confirm you understand the terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="performance_based"
                    checked={formData.understands_performance_based}
                    onCheckedChange={(checked) => updateField("understands_performance_based", !!checked)}
                  />
                  <label htmlFor="performance_based" className="text-sm cursor-pointer">
                    I understand this scholarship is performance-based, not guaranteed
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="credit_unlock"
                    checked={formData.understands_credit_unlock}
                    onCheckedChange={(checked) => updateField("understands_credit_unlock", !!checked)}
                  />
                  <label htmlFor="credit_unlock" className="text-sm cursor-pointer">
                    I understand that only top-performing students will unlock the $200–$1,000 tuition credit
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="community_rules"
                    checked={formData.agrees_community_rules}
                    onCheckedChange={(checked) => updateField("agrees_community_rules", !!checked)}
                  />
                  <label htmlFor="community_rules" className="text-sm cursor-pointer">
                    I agree to respect the community rules
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep < 6 ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Scholarship;