import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle, Clock } from "lucide-react";
import type { Bootcamp, BootcampApplication, ApplicationQuestion, RequiredPostLink } from "@/types/bootcamp";

const BootcampApply = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [existingApplication, setExistingApplication] = useState<BootcampApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [goals, setGoals] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [availabilityCommitment, setAvailabilityCommitment] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  
  // Dynamic form state for custom questions and post links
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [postLinkValues, setPostLinkValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [id, user]);

  useEffect(() => {
    // Pre-fill from profile
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const fetchData = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      
      // Fetch bootcamp
      const { data: bootcampData, error: bootcampError } = await supabase
        .from("bootcamps")
        .select("*")
        .eq("id", id)
        .single();

      if (bootcampError) throw bootcampError;
      setBootcamp(bootcampData as unknown as Bootcamp);

      // Check for existing application
      const { data: applicationData } = await supabase
        .from("bootcamp_applications")
        .select("*")
        .eq("bootcamp_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (applicationData) {
        setExistingApplication(applicationData as BootcampApplication);
      }

      // Also check if already a participant
      const { data: participantData } = await supabase
        .from("bootcamp_participants")
        .select("id")
        .eq("bootcamp_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (participantData) {
        // Already a participant, redirect to bootcamp
        navigate(`/bootcamps/${id}`);
        return;
      }
    } catch (err: any) {
      toast.error("Failed to load bootcamp", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !id || !bootcamp) return;

    if (!agreedToRules) {
      toast.error("Please agree to the bootcamp rules and expectations");
      return;
    }

    if (!availabilityCommitment) {
      toast.error("Please confirm your availability commitment");
      return;
    }

    // Validate required custom questions
    const customQuestions = bootcamp.application_questions || [];
    for (const q of customQuestions) {
      if (q.required && !customAnswers[q.id]?.trim()) {
        toast.error(`Please answer: ${q.question}`);
        return;
      }
    }

    // Validate required post links
    const postLinks = bootcamp.required_post_links || [];
    for (const p of postLinks) {
      if (p.required && !postLinkValues[p.id]?.trim()) {
        toast.error(`Please provide: ${p.label}`);
        return;
      }
    }

    // Combine custom answers and post links into why_join/goals for storage
    // Format: standard answers + custom questions + post links
    const customQuestionsText = customQuestions
      .map((q) => `${q.question}: ${customAnswers[q.id] || "N/A"}`)
      .join("\n\n");
    
    const postLinksText = postLinks
      .map((p) => `${p.label}: ${postLinkValues[p.id] || "N/A"}`)
      .join("\n");

    const combinedWhyJoin = whyJoin.trim() + 
      (customQuestionsText ? `\n\n--- Custom Responses ---\n${customQuestionsText}` : "") +
      (postLinksText ? `\n\n--- Post Links ---\n${postLinksText}` : "");

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("bootcamp_applications")
        .insert({
          bootcamp_id: id,
          user_id: user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          why_join: combinedWhyJoin,
          goals: goals.trim(),
          skill_level: skillLevel,
          availability_commitment: availabilityCommitment,
          agreed_to_rules: agreedToRules,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      navigate("/dashboard/bootcamps");
    } catch (err: any) {
      if (err.code === "23505") {
        toast.error("You have already applied to this bootcamp");
      } else {
        toast.error("Failed to submit application", { description: err.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <main className="pt-20 px-4">
          <div className="max-w-2xl mx-auto py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!bootcamp) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <main className="pt-20 px-4">
          <div className="max-w-2xl mx-auto py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Bootcamp Not Found</h1>
            <Link to="/bootcamps">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bootcamps
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Show existing application status
  if (existingApplication) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <main className="pt-20 px-4">
          <div className="max-w-2xl mx-auto py-12">
            <Link to="/bootcamps" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bootcamps
            </Link>

            <Card>
              <CardHeader className="text-center">
                {existingApplication.status === "approved" ? (
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                ) : existingApplication.status === "pending" ? (
                  <Clock className="w-16 h-16 mx-auto text-amber-500 mb-4" />
                ) : (
                  <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-destructive text-2xl">✗</span>
                  </div>
                )}
                <CardTitle>
                  {existingApplication.status === "approved"
                    ? "Application Approved!"
                    : existingApplication.status === "pending"
                    ? "Application Pending"
                    : "Application Rejected"}
                </CardTitle>
                <CardDescription>
                  {existingApplication.status === "approved"
                    ? "You have been accepted into this bootcamp."
                    : existingApplication.status === "pending"
                    ? "Your application is being reviewed. We'll notify you once a decision is made."
                    : "Unfortunately, your application was not accepted this time."}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Applied on {new Date(existingApplication.created_at).toLocaleDateString()}
                </p>
                {existingApplication.status === "approved" ? (
                  <Button asChild>
                    <Link to={`/bootcamps/${bootcamp.id}`}>Enter Bootcamp</Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/bootcamps">View My Bootcamps</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      <main className="pt-20 px-4">
        <div className="max-w-2xl mx-auto py-12">
          <Link to={`/bootcamps/${bootcamp.id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bootcamp
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Apply to {bootcamp.title}</CardTitle>
              <CardDescription>
                Complete this form to apply for the bootcamp. Your application will be reviewed before you can access the bootcamp content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    readOnly={!!profile?.email}
                    className={profile?.email ? "bg-muted" : ""}
                  />
                  {profile?.email && (
                    <p className="text-xs text-muted-foreground">Email is linked to your account</p>
                  )}
                </div>

                {/* Why Join */}
                <div className="space-y-2">
                  <Label htmlFor="whyJoin">Why do you want to join this bootcamp? *</Label>
                  <Textarea
                    id="whyJoin"
                    value={whyJoin}
                    onChange={(e) => setWhyJoin(e.target.value)}
                    placeholder="Tell us what motivates you to join..."
                    rows={4}
                    required
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{whyJoin.length}/1000 characters</p>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <Label htmlFor="goals">What do you hope to achieve by the end? *</Label>
                  <Textarea
                    id="goals"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="Describe your goals and expectations..."
                    rows={4}
                    required
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{goals.length}/1000 characters</p>
                </div>

                {/* Custom Application Questions */}
                {bootcamp.application_questions && bootcamp.application_questions.length > 0 && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-medium">Additional Questions</h3>
                    {bootcamp.application_questions.map((q) => (
                      <div key={q.id} className="space-y-2">
                        <Label htmlFor={`q-${q.id}`}>
                          {q.question} {q.required && "*"}
                        </Label>
                        <Textarea
                          id={`q-${q.id}`}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                          placeholder="Your answer..."
                          rows={3}
                          required={q.required}
                          maxLength={1000}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Required Post Links */}
                {bootcamp.required_post_links && bootcamp.required_post_links.length > 0 && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-medium">Required Post Links</h3>
                    {bootcamp.required_post_links.map((p) => {
                      const isPlaceholderUrl = p.placeholder?.startsWith("http");
                      return (
                        <div key={p.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`p-${p.id}`}>
                              {p.label} {p.required && "*"}
                            </Label>
                            {isPlaceholderUrl && (
                              <a
                                href={p.placeholder}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                (View post)
                              </a>
                            )}
                          </div>
                          <Input
                            id={`p-${p.id}`}
                            type="url"
                            value={postLinkValues[p.id] || ""}
                            onChange={(e) => setPostLinkValues({ ...postLinkValues, [p.id]: e.target.value })}
                            placeholder={isPlaceholderUrl ? "Paste your post link here" : (p.placeholder || "https://...")}
                            required={p.required}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Skill Level */}
                <div className="space-y-3">
                  <Label>Current skill level *</Label>
                  <RadioGroup value={skillLevel} onValueChange={setSkillLevel}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="font-normal">Beginner - Just starting out</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="font-normal">Intermediate - Some experience</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="font-normal">Advanced - Experienced practitioner</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Availability Commitment */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="availability"
                    checked={availabilityCommitment}
                    onCheckedChange={(checked) => setAvailabilityCommitment(checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="availability" className="font-normal cursor-pointer">
                      I can commit the required time for this {bootcamp.duration_days}-day bootcamp *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      You'll need to complete daily tasks and participate in the community
                    </p>
                  </div>
                </div>

                {/* Agreement */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreement"
                    checked={agreedToRules}
                    onCheckedChange={(checked) => setAgreedToRules(checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="agreement" className="font-normal cursor-pointer">
                      I agree to the bootcamp rules and expectations *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Including active participation, respectful behavior, and completing assigned tasks
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BootcampApply;
