import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TutorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STORAGE_KEY = "tutor-form-draft";

interface FormData {
  name: string;
  email: string;
  expertise: string;
  experience: string;
  portfolio: string;
  pitch: string;
}

const getStoredFormData = (): FormData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading form data from localStorage:", e);
  }
  return { name: "", email: "", expertise: "", experience: "", portfolio: "", pitch: "" };
};

const saveFormData = (data: FormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving form data to localStorage:", e);
  }
};

const clearFormData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing form data from localStorage:", e);
  }
};

const TutorForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>(getStoredFormData);
  const { toast } = useToast();

  React.useEffect(() => {
    saveFormData(formData);
  }, [formData]);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and get back to you within 48 hours.",
    });
    
    clearFormData();
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tutor-name">Full Name</Label>
        <Input 
          id="tutor-name" 
          placeholder="Enter your full name" 
          required 
          value={formData.name}
          onChange={handleChange("name")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tutor-email">Email Address</Label>
        <Input 
          id="tutor-email" 
          type="email" 
          placeholder="Enter your email" 
          required 
          value={formData.email}
          onChange={handleChange("email")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expertise">Area of Expertise</Label>
        <select 
          id="expertise" 
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          required
          value={formData.expertise}
          onChange={handleChange("expertise")}
        >
          <option value="">Select your expertise</option>
          <option value="development">Web3 Development</option>
          <option value="trading">Trading & DeFi</option>
          <option value="marketing">Marketing & Growth</option>
          <option value="content">Content Creation</option>
          <option value="design">Design & UI/UX</option>
          <option value="ai">AI & Automation</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <select 
          id="experience" 
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          required
          value={formData.experience}
          onChange={handleChange("experience")}
        >
          <option value="">Select experience</option>
          <option value="1-2">1-2 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5+">5+ years</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolio">Portfolio / LinkedIn URL</Label>
        <Input 
          id="portfolio" 
          type="url" 
          placeholder="https://..." 
          value={formData.portfolio}
          onChange={handleChange("portfolio")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pitch">Why do you want to teach? (Brief pitch)</Label>
        <Textarea 
          id="pitch" 
          placeholder="Tell us about your teaching style and what you'd like to teach..." 
          required 
          rows={4}
          value={formData.pitch}
          onChange={handleChange("pitch")}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Application"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};

const TutorFormDialog = ({ open, onOpenChange }: TutorFormDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header with close button */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-secondary bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Become a Tutor</span>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Close form"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-8 md:py-12">
          {/* Header content */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Become a Tutor
            </h1>
            <p className="text-muted-foreground mb-4">
              Share your expertise and earn royalties on every course sale.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-foreground text-sm mb-2">💰 Earn Royalties</h3>
              <p className="text-sm text-muted-foreground">
                Get a percentage of every sale from courses you create. Build passive income while helping others learn.
              </p>
            </div>
          </div>

          {/* Form */}
          <TutorForm onSuccess={() => {
            onOpenChange(false);
          }} />

          {/* Legal links */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By applying, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Your progress is automatically saved. You can close and return anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorFormDialog;
