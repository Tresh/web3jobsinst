import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, GraduationCap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ScholarshipFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STORAGE_KEY = "scholarship-form-draft";

interface FormData {
  name: string;
  email: string;
  experience: string;
  goals: string;
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
  return { name: "", email: "", experience: "", goals: "" };
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

const ScholarshipForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>(getStoredFormData);
  const { toast } = useToast();

  // Save to localStorage on every change
  React.useEffect(() => {
    saveFormData(formData);
  }, [formData]);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Registration Successful!",
      description: "You've been added to the scholarship waitlist. We'll be in touch soon.",
    });
    
    // Clear stored data on successful submission
    clearFormData();
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          placeholder="Enter your full name" 
          required 
          value={formData.name}
          onChange={handleChange("name")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter your email" 
          required 
          value={formData.email}
          onChange={handleChange("email")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="experience">Web3 Experience Level</Label>
        <select 
          id="experience" 
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          required
          value={formData.experience}
          onChange={handleChange("experience")}
        >
          <option value="">Select your experience</option>
          <option value="beginner">Complete Beginner</option>
          <option value="some">Some Knowledge</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goals">What do you want to achieve?</Label>
        <Input 
          id="goals" 
          placeholder="e.g., Get a Web3 job, learn trading..." 
          required 
          value={formData.goals}
          onChange={handleChange("goals")}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Register for Scholarship"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};

const ScholarshipFormDialog = ({ open, onOpenChange }: ScholarshipFormDialogProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasExistingApplication, setHasExistingApplication] = React.useState<boolean | null>(null);

  // Check if user has already applied
  React.useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user?.id) {
        setHasExistingApplication(false);
        return;
      }
      
      const { data } = await supabase
        .from("scholarship_applications")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      
      if (data && data.length > 0) {
        setHasExistingApplication(true);
        // Redirect to dashboard scholarship page
        onOpenChange(false);
        navigate("/dashboard/scholarship");
      } else {
        setHasExistingApplication(false);
      }
    };

    if (open) {
      checkExistingApplication();
    }
  }, [open, user?.id, navigate, onOpenChange]);

  if (!open) return null;

  // Don't render if checking or has existing application
  if (hasExistingApplication === null || hasExistingApplication) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header with close button */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-secondary bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Scholarship Registration</span>
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
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Web3 Scholarship Program
            </h1>
            <p className="text-muted-foreground">
              Join our free 30-day onboarding program and kickstart your Web3 career.
            </p>
          </div>

          {/* Form */}
          <ScholarshipForm onSuccess={() => {
            onOpenChange(false);
          }} />

          {/* Legal links */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By registering, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>

          {/* Note about data persistence */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            Your progress is automatically saved. You can close and return anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipFormDialog;
