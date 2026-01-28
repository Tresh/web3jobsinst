import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const bugReportSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

interface BugReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BugReportModal = ({ open, onOpenChange }: BugReportModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const form = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: "",
      description: "",
      email: "",
    },
  });

  // Auto-fill email if logged in
  useEffect(() => {
    if (profile?.email) {
      form.setValue("email", profile.email);
    }
  }, [profile, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setIsSuccess(false);
        form.reset();
        setScreenshots([]);
      }, 300);
    }
  }, [open, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format.`,
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit.`,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (screenshots.length + validFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "Maximum 5 screenshots allowed.",
        variant: "destructive",
      });
      return;
    }

    setScreenshots((prev) => [...prev, ...validFiles]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadScreenshots = async (): Promise<string[]> => {
    if (screenshots.length === 0) return [];
    
    setUploadingFiles(true);
    const urls: string[] = [];
    
    try {
      for (const file of screenshots) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("bug-report-screenshots")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("bug-report-screenshots")
          .getPublicUrl(filePath);

        urls.push(urlData.publicUrl);
      }
      return urls;
    } finally {
      setUploadingFiles(false);
    }
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    return ua;
  };

  const getDeviceInfo = () => {
    const { platform } = navigator;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    return `${platform} - ${screenWidth}x${screenHeight}`;
  };

  const onSubmit = async (data: BugReportFormData) => {
    setIsSubmitting(true);
    
    try {
      // Upload screenshots first
      const screenshotUrls = await uploadScreenshots();

      // Insert bug report
      const { error } = await supabase.from("bug_reports").insert({
        reporter_user_id: user?.id || null,
        reporter_email: data.email || null,
        reporter_name: profile?.full_name || null,
        title: data.title,
        description: data.description,
        page_url: window.location.href,
        device_info: getDeviceInfo(),
        browser_info: getBrowserInfo(),
        screenshot_urls: screenshotUrls,
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting bug report:", error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-primary mb-4" />
            <DialogTitle className="text-xl mb-2">Thank You!</DialogTitle>
            <DialogDescription className="text-base">
              Your issue has been submitted and our team will review it.
            </DialogDescription>
            <Button onClick={() => onOpenChange(false)} className="mt-6">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Help us improve by reporting any bugs or issues you encounter.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief summary of the issue" 
                      {...field} 
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's the problem? Please describe in detail..."
                      className="min-h-[120px] resize-none"
                      {...field}
                      maxLength={2000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Email {!user && "(optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="your@email.com" 
                      {...field} 
                      disabled={!!profile?.email}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Screenshots (optional)</label>
              <div className="flex flex-wrap gap-2">
                {screenshots.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-md overflow-hidden border border-border"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {screenshots.length < 5 && (
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Max 5 images, 5MB each. Supported: JPG, PNG, GIF, WebP
              </p>
            </div>

            {/* Auto-captured info notice */}
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              We'll automatically capture the current page URL and your device/browser info to help diagnose the issue.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadingFiles}
                className="flex-1"
              >
                {(isSubmitting || uploadingFiles) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {uploadingFiles ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BugReportModal;
