import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScholarshipFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScholarshipForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Registration Successful!",
      description: "You've been added to the scholarship waitlist. We'll be in touch soon.",
    });
    
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter your full name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="Enter your email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="experience">Web3 Experience Level</Label>
        <select 
          id="experience" 
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          required
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
        <Input id="goals" placeholder="e.g., Get a Web3 job, learn trading..." required />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Register for Scholarship"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};

const ScholarshipFormDialog = ({ open, onOpenChange }: ScholarshipFormDialogProps) => {
  const isMobile = useIsMobile();

  const headerContent = (
    <>
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <GraduationCap className="w-6 h-6 text-primary" />
      </div>
      <div className="text-xl font-semibold">Web3 Scholarship Program</div>
      <div className="text-sm text-muted-foreground">
        Join our free 30-day onboarding program and kickstart your Web3 career.
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            {headerContent}
          </DrawerHeader>
          <div className="px-4 pb-8">
            <ScholarshipForm onSuccess={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          {headerContent}
        </DialogHeader>
        <ScholarshipForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ScholarshipFormDialog;
