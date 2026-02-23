import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Rocket } from "lucide-react";

interface LearnFiPartnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LearnFiPartnerForm = ({ open, onOpenChange }: LearnFiPartnerFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    project_name: "",
    project_website: "",
    partner_name: "",
    partner_email: "",
    title: "",
    description: "",
    category: "general",
    reward_type: "xp",
    duration_days: "30",
    difficulty: "beginner",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.project_name || !form.partner_email || !form.title) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("learnfi_programs").insert({
        project_name: form.project_name,
        project_website: form.project_website || null,
        partner_name: form.partner_name || null,
        partner_email: form.partner_email,
        title: form.title,
        description: form.description || null,
        category: form.category,
        reward_type: form.reward_type,
        duration_days: parseInt(form.duration_days) || 30,
        difficulty: form.difficulty,
        status: "pending_approval",
      });

      if (error) throw error;

      toast({ title: "Program submitted!", description: "Your LearnFi program proposal has been submitted for review." });
      onOpenChange(false);
      setForm({
        project_name: "",
        project_website: "",
        partner_name: "",
        partner_email: "",
        title: "",
        description: "",
        category: "general",
        reward_type: "xp",
        duration_days: "30",
        difficulty: "beginner",
      });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Launch a LearnFi Program
          </DialogTitle>
          <DialogDescription>
            Submit your project's learn-to-earn program for review. We'll get back to you within 48 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input
                value={form.project_name}
                onChange={(e) => handleChange("project_name", e.target.value)}
                placeholder="e.g. Solana Foundation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.project_website}
                onChange={(e) => handleChange("project_website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input
                value={form.partner_name}
                onChange={(e) => handleChange("partner_name", e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.partner_email}
                onChange={(e) => handleChange("partner_email", e.target.value)}
                placeholder="you@project.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Program Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Learn Solana Development"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="What will participants learn? What missions will they complete?"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="web3">Web3</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reward Type</Label>
              <Select value={form.reward_type} onValueChange={(v) => handleChange("reward_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Token</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="xp">XP</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => handleChange("difficulty", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration (days)</Label>
            <Input
              type="number"
              value={form.duration_days}
              onChange={(e) => handleChange("duration_days", e.target.value)}
              min={1}
              max={365}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Program Proposal"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LearnFiPartnerForm;
