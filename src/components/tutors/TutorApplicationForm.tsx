import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "tutor-application-draft";

interface FormData {
  // Personal Info
  name: string;
  email: string;
  country: string;
  timezone: string;
  linkedin: string;
  twitter: string;
  website: string;
  // Background
  primarySkill: string;
  secondarySkills: string;
  yearsExperience: string;
  pastRoles: string;
  currentRole: string;
  // Course Proposal
  courseTitle: string;
  category: string;
  skillLevel: string;
  description: string;
  learningOutcomes: string;
  moduleBreakdown: string;
  estimatedLength: string;
  hasPracticalTasks: boolean;
  hasTemplates: boolean;
  // Proof of Work
  portfolioLinks: string;
  github: string;
  caseStudies: string;
  publishedWork: string;
  teachingExperience: string;
  // Teaching Format
  teachingFormat: string;
  // Equipment
  hasMic: boolean;
  hasCamera: boolean;
  hasScreenRecorder: boolean;
  // Monetization
  monetizationPreference: string;
  // Motivation
  whyTeach: string;
  whatMakesQualified: string;
  impactToCreate: string;
  // Agreements
  agreeContentGuidelines: boolean;
  agreeRoyaltyStructure: boolean;
  agreeQualityStandards: boolean;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  country: "",
  timezone: "",
  linkedin: "",
  twitter: "",
  website: "",
  primarySkill: "",
  secondarySkills: "",
  yearsExperience: "",
  pastRoles: "",
  currentRole: "",
  courseTitle: "",
  category: "",
  skillLevel: "",
  description: "",
  learningOutcomes: "",
  moduleBreakdown: "",
  estimatedLength: "",
  hasPracticalTasks: false,
  hasTemplates: false,
  portfolioLinks: "",
  github: "",
  caseStudies: "",
  publishedWork: "",
  teachingExperience: "",
  teachingFormat: "",
  hasMic: false,
  hasCamera: false,
  hasScreenRecorder: false,
  monetizationPreference: "",
  whyTeach: "",
  whatMakesQualified: "",
  impactToCreate: "",
  agreeContentGuidelines: false,
  agreeRoyaltyStructure: false,
  agreeQualityStandards: false,
};

const getStoredFormData = (): FormData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...initialFormData, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Error reading form data:", e);
  }
  return initialFormData;
};

const saveFormData = (data: FormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving form data:", e);
  }
};

const clearFormData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing form data:", e);
  }
};

const TOTAL_STEPS = 8;

const TutorApplicationForm = () => {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<FormData>(getStoredFormData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    saveFormData(formData);
  }, [formData]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and get back to you within 7 business days.",
    });
    
    clearFormData();
    setFormData(initialFormData);
    setStep(1);
    setIsSubmitting(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="Your country"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone *</Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => updateField("timezone", e.target.value)}
                  placeholder="e.g., UTC+1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X Handle</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => updateField("twitter", e.target.value)}
                  placeholder="@yourhandle"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Professional Background</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primarySkill">Primary Skill *</Label>
                <select
                  id="primarySkill"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.primarySkill}
                  onChange={(e) => updateField("primarySkill", e.target.value)}
                  required
                >
                  <option value="">Select your primary skill</option>
                  <option value="development">Web3 Development</option>
                  <option value="trading">Trading & DeFi</option>
                  <option value="marketing">Marketing & Growth</option>
                  <option value="design">Design & UI/UX</option>
                  <option value="content">Content Creation</option>
                  <option value="community">Community Management</option>
                  <option value="research">Research & Analysis</option>
                  <option value="operations">DAO Operations</option>
                  <option value="ai">AI & Automation</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondarySkills">Secondary Skills</Label>
                <Input
                  id="secondarySkills"
                  value={formData.secondarySkills}
                  onChange={(e) => updateField("secondarySkills", e.target.value)}
                  placeholder="e.g., Smart Contracts, Tokenomics, Growth Hacking"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                <select
                  id="yearsExperience"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.yearsExperience}
                  onChange={(e) => updateField("yearsExperience", e.target.value)}
                  required
                >
                  <option value="">Select experience level</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastRoles">Past Roles</Label>
                <Textarea
                  id="pastRoles"
                  value={formData.pastRoles}
                  onChange={(e) => updateField("pastRoles", e.target.value)}
                  placeholder="List your relevant past roles and companies"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role *</Label>
                <Input
                  id="currentRole"
                  value={formData.currentRole}
                  onChange={(e) => updateField("currentRole", e.target.value)}
                  placeholder="Your current position and company"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Course Proposal</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title *</Label>
                <Input
                  id="courseTitle"
                  value={formData.courseTitle}
                  onChange={(e) => updateField("courseTitle", e.target.value)}
                  placeholder="e.g., Smart Contract Development with Solidity"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="development">Development</option>
                    <option value="trading">Trading & DeFi</option>
                    <option value="marketing">Marketing</option>
                    <option value="design">Design</option>
                    <option value="ai">AI & Automation</option>
                    <option value="foundations">Foundations</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Skill Level *</Label>
                  <select
                    id="skillLevel"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.skillLevel}
                    onChange={(e) => updateField("skillLevel", e.target.value)}
                    required
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe what this course covers"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learningOutcomes">Learning Outcomes *</Label>
                <Textarea
                  id="learningOutcomes"
                  value={formData.learningOutcomes}
                  onChange={(e) => updateField("learningOutcomes", e.target.value)}
                  placeholder="What will students learn? List 3-5 outcomes"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Course Structure</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="moduleBreakdown">Module Breakdown *</Label>
                <Textarea
                  id="moduleBreakdown"
                  value={formData.moduleBreakdown}
                  onChange={(e) => updateField("moduleBreakdown", e.target.value)}
                  placeholder="List the modules/sections of your course"
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedLength">Estimated Course Length *</Label>
                <select
                  id="estimatedLength"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.estimatedLength}
                  onChange={(e) => updateField("estimatedLength", e.target.value)}
                  required
                >
                  <option value="">Select duration</option>
                  <option value="1-2h">1-2 hours</option>
                  <option value="3-5h">3-5 hours</option>
                  <option value="6-10h">6-10 hours</option>
                  <option value="10+h">10+ hours</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label>Additional Resources</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPracticalTasks"
                    checked={formData.hasPracticalTasks}
                    onCheckedChange={(checked) => updateField("hasPracticalTasks", !!checked)}
                  />
                  <label htmlFor="hasPracticalTasks" className="text-sm">
                    Includes practical tasks/exercises
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTemplates"
                    checked={formData.hasTemplates}
                    onCheckedChange={(checked) => updateField("hasTemplates", !!checked)}
                  />
                  <label htmlFor="hasTemplates" className="text-sm">
                    Includes templates/resources
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Proof of Work</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="portfolioLinks">Portfolio Links *</Label>
                <Textarea
                  id="portfolioLinks"
                  value={formData.portfolioLinks}
                  onChange={(e) => updateField("portfolioLinks", e.target.value)}
                  placeholder="Links to your portfolio, projects, or work samples"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => updateField("github", e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseStudies">Case Studies</Label>
                <Textarea
                  id="caseStudies"
                  value={formData.caseStudies}
                  onChange={(e) => updateField("caseStudies", e.target.value)}
                  placeholder="Links to or descriptions of relevant case studies"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedWork">Published Work</Label>
                <Textarea
                  id="publishedWork"
                  value={formData.publishedWork}
                  onChange={(e) => updateField("publishedWork", e.target.value)}
                  placeholder="Articles, videos, podcasts, or other published content"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teachingExperience">Past Teaching Experience</Label>
                <Textarea
                  id="teachingExperience"
                  value={formData.teachingExperience}
                  onChange={(e) => updateField("teachingExperience", e.target.value)}
                  placeholder="Any previous teaching, mentoring, or training experience"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Teaching Format & Equipment</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teachingFormat">Preferred Teaching Format *</Label>
                <select
                  id="teachingFormat"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.teachingFormat}
                  onChange={(e) => updateField("teachingFormat", e.target.value)}
                  required
                >
                  <option value="">Select format</option>
                  <option value="pre-recorded">Pre-recorded videos</option>
                  <option value="live">Live sessions</option>
                  <option value="hybrid">Hybrid (pre-recorded + live)</option>
                  <option value="cohort">Cohort-based</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label>Equipment Available</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMic"
                    checked={formData.hasMic}
                    onCheckedChange={(checked) => updateField("hasMic", !!checked)}
                  />
                  <label htmlFor="hasMic" className="text-sm">
                    Quality microphone
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasCamera"
                    checked={formData.hasCamera}
                    onCheckedChange={(checked) => updateField("hasCamera", !!checked)}
                  />
                  <label htmlFor="hasCamera" className="text-sm">
                    Webcam/Camera
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasScreenRecorder"
                    checked={formData.hasScreenRecorder}
                    onCheckedChange={(checked) => updateField("hasScreenRecorder", !!checked)}
                  />
                  <label htmlFor="hasScreenRecorder" className="text-sm">
                    Screen recording software
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monetizationPreference">Monetization Preference *</Label>
                <select
                  id="monetizationPreference"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.monetizationPreference}
                  onChange={(e) => updateField("monetizationPreference", e.target.value)}
                  required
                >
                  <option value="">Select preference</option>
                  <option value="revenue-share">Revenue share (% of each sale)</option>
                  <option value="fixed-price">Fixed price per course</option>
                  <option value="subscription-pool">Subscription pool share</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Motivation</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whyTeach">Why do you want to teach? *</Label>
                <Textarea
                  id="whyTeach"
                  value={formData.whyTeach}
                  onChange={(e) => updateField("whyTeach", e.target.value)}
                  placeholder="What drives you to share your knowledge?"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatMakesQualified">What makes you qualified? *</Label>
                <Textarea
                  id="whatMakesQualified"
                  value={formData.whatMakesQualified}
                  onChange={(e) => updateField("whatMakesQualified", e.target.value)}
                  placeholder="Why are you the right person to teach this topic?"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impactToCreate">What impact do you want to create? *</Label>
                <Textarea
                  id="impactToCreate"
                  value={formData.impactToCreate}
                  onChange={(e) => updateField("impactToCreate", e.target.value)}
                  placeholder="How do you want to help your students?"
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Agreements</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeContentGuidelines"
                  checked={formData.agreeContentGuidelines}
                  onCheckedChange={(checked) => updateField("agreeContentGuidelines", !!checked)}
                />
                <label htmlFor="agreeContentGuidelines" className="text-sm leading-relaxed">
                  I agree to follow the content guidelines and maintain high-quality standards for all course materials.
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeRoyaltyStructure"
                  checked={formData.agreeRoyaltyStructure}
                  onCheckedChange={(checked) => updateField("agreeRoyaltyStructure", !!checked)}
                />
                <label htmlFor="agreeRoyaltyStructure" className="text-sm leading-relaxed">
                  I understand and accept the royalty structure and payment terms.
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeQualityStandards"
                  checked={formData.agreeQualityStandards}
                  onCheckedChange={(checked) => updateField("agreeQualityStandards", !!checked)}
                />
                <label htmlFor="agreeQualityStandards" className="text-sm leading-relaxed">
                  I commit to maintaining quality standards and responding to student feedback.
                </label>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-lg mt-6">
              <p className="text-sm text-muted-foreground">
                By submitting this application, you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.country && formData.timezone;
      case 2:
        return formData.primarySkill && formData.yearsExperience && formData.currentRole;
      case 3:
        return formData.courseTitle && formData.category && formData.skillLevel && formData.description && formData.learningOutcomes;
      case 4:
        return formData.moduleBreakdown && formData.estimatedLength;
      case 5:
        return formData.portfolioLinks;
      case 6:
        return formData.teachingFormat && formData.monetizationPreference;
      case 7:
        return formData.whyTeach && formData.whatMakesQualified && formData.impactToCreate;
      case 8:
        return formData.agreeContentGuidelines && formData.agreeRoyaltyStructure && formData.agreeQualityStandards;
      default:
        return true;
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6 md:p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Your progress is automatically saved. You can close and return anytime.
        </p>
      </CardContent>
    </Card>
  );
};

export default TutorApplicationForm;
