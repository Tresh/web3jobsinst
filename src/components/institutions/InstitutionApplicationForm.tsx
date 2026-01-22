import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "institution-application-draft";

interface FormData {
  organizationName: string;
  website: string;
  ecosystemCategory: string;
  officialEmail: string;
  contactPerson: string;
  role: string;
  whyPortal: string;
  whatToTeach: string;
  plannedCourses: string;
  hasCertifications: boolean;
  hiringNeeds: string;
  communitySize: string;
  agreeTerms: boolean;
  agreeQuality: boolean;
}

const initialFormData: FormData = {
  organizationName: "",
  website: "",
  ecosystemCategory: "",
  officialEmail: "",
  contactPerson: "",
  role: "",
  whyPortal: "",
  whatToTeach: "",
  plannedCourses: "",
  hasCertifications: false,
  hiringNeeds: "",
  communitySize: "",
  agreeTerms: false,
  agreeQuality: false,
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

const TOTAL_STEPS = 3;

const InstitutionApplicationForm = () => {
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
      description: "Our partnerships team will contact you within 5 business days.",
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
              <CardTitle className="text-lg">Organization Details</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => updateField("organizationName", e.target.value)}
                  placeholder="e.g., Solana Foundation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website *</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://yourprotocol.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ecosystemCategory">Ecosystem Category *</Label>
                <select
                  id="ecosystemCategory"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.ecosystemCategory}
                  onChange={(e) => updateField("ecosystemCategory", e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="L1">Layer 1 Blockchain</option>
                  <option value="L2">Layer 2 / Rollup</option>
                  <option value="DeFi">DeFi Protocol</option>
                  <option value="Infra">Infrastructure</option>
                  <option value="NFT">NFT / Gaming</option>
                  <option value="AI">AI / ML</option>
                  <option value="DAO">DAO</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="officialEmail">Official Email *</Label>
                <Input
                  id="officialEmail"
                  type="email"
                  value={formData.officialEmail}
                  onChange={(e) => updateField("officialEmail", e.target.value)}
                  placeholder="partnerships@yourprotocol.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => updateField("contactPerson", e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role">Role in Organization *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  placeholder="e.g., Head of Developer Relations"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Portal Goals</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whyPortal">Why do you want a portal? *</Label>
                <Textarea
                  id="whyPortal"
                  value={formData.whyPortal}
                  onChange={(e) => updateField("whyPortal", e.target.value)}
                  placeholder="What are your goals for having a dedicated learning portal?"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatToTeach">What do you want to teach? *</Label>
                <Textarea
                  id="whatToTeach"
                  value={formData.whatToTeach}
                  onChange={(e) => updateField("whatToTeach", e.target.value)}
                  placeholder="Describe the topics and skills you want to offer"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plannedCourses">Number of Planned Courses *</Label>
                <select
                  id="plannedCourses"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.plannedCourses}
                  onChange={(e) => updateField("plannedCourses", e.target.value)}
                  required
                >
                  <option value="">Select range</option>
                  <option value="1-5">1-5 courses</option>
                  <option value="6-15">6-15 courses</option>
                  <option value="16-30">16-30 courses</option>
                  <option value="30+">30+ courses</option>
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="hasCertifications"
                  checked={formData.hasCertifications}
                  onCheckedChange={(checked) => updateField("hasCertifications", !!checked)}
                />
                <label htmlFor="hasCertifications" className="text-sm">
                  We want to offer official certifications
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hiringNeeds">Hiring Needs</Label>
                <Textarea
                  id="hiringNeeds"
                  value={formData.hiringNeeds}
                  onChange={(e) => updateField("hiringNeeds", e.target.value)}
                  placeholder="Do you have talent pipeline or hiring needs?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="communitySize">Community Size *</Label>
                <select
                  id="communitySize"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={formData.communitySize}
                  onChange={(e) => updateField("communitySize", e.target.value)}
                  required
                >
                  <option value="">Select size</option>
                  <option value="<1000">&lt;1,000 members</option>
                  <option value="1000-10000">1,000 - 10,000 members</option>
                  <option value="10000-100000">10,000 - 100,000 members</option>
                  <option value="100000+">100,000+ members</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Agreements</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => updateField("agreeTerms", !!checked)}
                />
                <label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  I agree to the partnership terms and conditions for Verified Institutions.
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeQuality"
                  checked={formData.agreeQuality}
                  onCheckedChange={(checked) => updateField("agreeQuality", !!checked)}
                />
                <label htmlFor="agreeQuality" className="text-sm leading-relaxed">
                  We commit to maintaining high-quality educational content and standards.
                </label>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-lg mt-6">
              <p className="text-sm text-muted-foreground">
                By submitting this application, you confirm you are authorized to represent your organization
                and agree to our{" "}
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
        return formData.organizationName && formData.website && formData.ecosystemCategory && 
               formData.officialEmail && formData.contactPerson && formData.role;
      case 2:
        return formData.whyPortal && formData.whatToTeach && formData.plannedCourses && formData.communitySize;
      case 3:
        return formData.agreeTerms && formData.agreeQuality;
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
              {isSubmitting ? "Submitting..." : "Apply as Verified Institution"}
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

export default InstitutionApplicationForm;
