import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { courses as platformCourses } from "@/data/coursesData";
import { useNavigate } from "react-router-dom";
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
import { Loader2, Rocket, Info, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LearnFiPartnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LeaderboardTier {
  rank_from: number;
  rank_to: number;
  amount: number;
}

// Course autocomplete sub-component
const CourseAutocomplete = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return platformCourses.filter(c => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const selectedCourse = platformCourses.find(c => c.id === value);

  return (
    <div className="relative">
      <Input
        value={selectedCourse ? selectedCourse.title : value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          setQuery(v);
          setShowDropdown(true);
        }}
        onFocus={() => { if (query.length > 0) setShowDropdown(true); }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Type course name or paste ID..."
      />
      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(c.id);
                setQuery(c.title);
                setShowDropdown(false);
              }}
            >
              <span className="font-medium">{c.title}</span>
              <span className="text-xs text-muted-foreground ml-2">({c.id})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LearnFiPartnerForm = ({ open, onOpenChange }: LearnFiPartnerFormProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    project_name: "",
    project_website: "",
    title: "",
    description: "",
    category: "general",
    reward_type: "xp",
    duration_days: "30",
    difficulty: "beginner",
    // Paid fields
    reward_amount: "",
    reward_amount_type: "total",
    max_participants: "",
    // Token fields
    token_is_stable: "false",
    token_name: "",
    token_contract_address: "",
    reward_token_symbol: "",
    chain_network: "",
    leaderboard_tiers: [{ rank_from: 1, rank_to: 1, amount: 0 }] as LeaderboardTier[],
    // Internship fields
    internship_details: "",
    // Course linking
    linked_course_id: "",
  });

  // Fetch user's courses (from strapi or local data — using a simple approach)
  useEffect(() => {
    // For now, we don't have a user-specific course table, so leave empty
    // This can be enhanced when tutors have uploaded courses
    setCourses([]);
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTier = () => {
    const lastTier = form.leaderboard_tiers[form.leaderboard_tiers.length - 1];
    const nextFrom = lastTier ? lastTier.rank_to + 1 : 1;
    setForm((prev) => ({
      ...prev,
      leaderboard_tiers: [...prev.leaderboard_tiers, { rank_from: nextFrom, rank_to: nextFrom, amount: 0 }],
    }));
  };

  const removeTier = (index: number) => {
    if (form.leaderboard_tiers.length <= 1) return;
    setForm((prev) => {
      const filtered = prev.leaderboard_tiers.filter((_, i) => i !== index);
      const resequenced: LeaderboardTier[] = [];
      for (let i = 0; i < filtered.length; i++) {
        const newFrom = i === 0 ? 1 : resequenced[i - 1].rank_to + 1;
        const newTo = Math.max(newFrom, i === 0 ? filtered[i].rank_to : newFrom + (filtered[i].rank_to - filtered[i].rank_from));
        resequenced.push({ ...filtered[i], rank_from: newFrom, rank_to: newTo });
      }
      return { ...prev, leaderboard_tiers: resequenced };
    });
  };

  const updateTier = (index: number, field: "rank_to" | "amount", value: number) => {
    setForm((prev) => {
      const updated = prev.leaderboard_tiers.map((t, i) => {
        if (i !== index) return t;
        if (field === "rank_to") return { ...t, rank_to: Math.max(t.rank_from, value) };
        return { ...t, amount: value };
      });
      // Re-sequence subsequent tiers' rank_from based on previous rank_to
      for (let i = 1; i < updated.length; i++) {
        const newFrom = updated[i - 1].rank_to + 1;
        if (updated[i].rank_from !== newFrom) {
          updated[i] = { ...updated[i], rank_from: newFrom, rank_to: Math.max(newFrom, updated[i].rank_to) };
        }
      }
      return { ...prev, leaderboard_tiers: updated };
    });
  };

  const getTotalCoveredRanks = () => {
    if (form.leaderboard_tiers.length === 0) return 0;
    return form.leaderboard_tiers[form.leaderboard_tiers.length - 1].rank_to;
  };

  const getTotalTokens = () => {
    return form.leaderboard_tiers.reduce((sum, tier) => {
      const count = tier.rank_to - tier.rank_from + 1;
      return sum + (count * tier.amount);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", { state: { from: { pathname: "/learnfi" } } });
      return;
    }

    if (!form.project_name || !form.title) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (form.reward_type === "token" && getTotalCoveredRanks() < 10) {
      toast({ title: "Minimum 10 positions", description: "Token rewards must cover at least 10 leaderboard positions.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const insertData: Record<string, unknown> = {
        project_name: form.project_name,
        project_website: form.project_website || null,
        partner_name: profile?.full_name || null,
        partner_email: user.email || null,
        title: form.title,
        description: form.description || null,
        category: form.category,
        reward_type: form.reward_type,
        duration_days: parseInt(form.duration_days) || 30,
        difficulty: form.difficulty,
        status: "pending_approval",
        created_by: user.id,
        linked_course_id: form.linked_course_id || null,
      };

      // Reward-specific fields
      if (form.reward_type === "paid") {
        insertData.reward_amount = parseFloat(form.reward_amount) || null;
        insertData.reward_amount_type = form.reward_amount_type;
        insertData.max_participants = parseInt(form.max_participants) || null;
      } else if (form.reward_type === "token") {
        insertData.token_is_stable = form.token_is_stable === "true";
        insertData.token_name = form.token_name || null;
        insertData.token_contract_address = form.token_contract_address || null;
        insertData.reward_token_symbol = form.reward_token_symbol || null;
        insertData.chain_network = form.chain_network || null;
        insertData.reward_amount = parseFloat(form.reward_amount) || null;
        insertData.max_participants = parseInt(form.max_participants) || null;
        insertData.leaderboard_tiers = form.leaderboard_tiers;
      } else if (form.reward_type === "internship") {
        insertData.internship_details = form.internship_details || null;
      }

      const { error } = await supabase.from("learnfi_programs").insert(insertData as any);
      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Program submitted!", description: "Your LearnFi program proposal has been submitted for review." });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth gate
  if (!user && open) {
    navigate("/login", { state: { from: { pathname: "/learnfi" } } });
    onOpenChange(false);
    return null;
  }

  // Post-submission view
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSubmitted(false); }}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Program Submitted!
            </DialogTitle>
            <DialogDescription>
              We'll review your proposal within 48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Want to add course content?</p>
                  <p className="text-sm text-muted-foreground">
                    If you haven't already, apply as a Tutor to upload courses and manage program modules.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <a href="/tutors">Become a Tutor</a>
              </Button>
              <Button className="flex-1" onClick={() => { onOpenChange(false); setSubmitted(false); }}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Launch a LearnFi Program
          </DialogTitle>
          <DialogDescription>
            Submit your project's learn-to-earn program. Linked to your profile as a Brand partner.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Project info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project / Brand Name *</Label>
              <Input value={form.project_name} onChange={(e) => handleChange("project_name", e.target.value)} placeholder="e.g. Solana Foundation" required />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.project_website} onChange={(e) => handleChange("project_website", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Program Title *</Label>
            <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="e.g. Learn Solana Development" required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="What will participants learn?" rows={3} />
          </div>

          {/* Link to existing course (optional) */}
          <div className="space-y-2">
            <Label>Link to Existing Course (optional)</Label>
            <CourseAutocomplete
              value={form.linked_course_id}
              onChange={(v) => handleChange("linked_course_id", v)}
            />
            <p className="text-xs text-muted-foreground">Type a course name to search, or paste a Course ID directly.</p>
          </div>

          {/* Category & Difficulty */}
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
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input type="number" value={form.duration_days} onChange={(e) => handleChange("duration_days", e.target.value)} min={1} max={365} />
            </div>
          </div>

          {/* Reward Type */}
          <div className="space-y-2">
            <Label>Reward Type *</Label>
            <Select value={form.reward_type} onValueChange={(v) => handleChange("reward_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="token">Token</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">XP rewards are only available for platform-created programs.</p>
          </div>

          {/* ═══ Paid Reward Fields ═══ */}
          {form.reward_type === "paid" && (
            <div className="space-y-4 bg-secondary/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground">Paid Reward Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount ($) *</Label>
                  <Input type="number" value={form.reward_amount} onChange={(e) => handleChange("reward_amount", e.target.value)} placeholder="e.g. 1000" min={0} />
                </div>
                <div className="space-y-2">
                  <Label>Amount Type</Label>
                  <Select value={form.reward_amount_type} onValueChange={(v) => handleChange("reward_amount_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total Pool</SelectItem>
                      <SelectItem value="per_participant">Per Participant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Participants</Label>
                <Input type="number" value={form.max_participants} onChange={(e) => handleChange("max_participants", e.target.value)} placeholder="e.g. 50" min={1} />
              </div>
            </div>
          )}

          {/* ═══ Token Reward Fields ═══ */}
          {form.reward_type === "token" && (
            <div className="space-y-4 bg-secondary/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground">Token Reward Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Token Type</Label>
                  <Select value={form.token_is_stable} onValueChange={(v) => handleChange("token_is_stable", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Stablecoin (USDT, USDC, etc.)</SelectItem>
                      <SelectItem value="false">Project Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chain / Network</Label>
                  <Input value={form.chain_network} onChange={(e) => handleChange("chain_network", e.target.value)} placeholder="e.g. Solana, Ethereum" />
                </div>
              </div>

              {form.token_is_stable === "false" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Token Name</Label>
                    <Input value={form.token_name} onChange={(e) => handleChange("token_name", e.target.value)} placeholder="e.g. MyToken" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contract Address (CA)</Label>
                    <Input value={form.token_contract_address} onChange={(e) => handleChange("token_contract_address", e.target.value)} placeholder="0x..." />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Token Symbol</Label>
                  <Input value={form.reward_token_symbol} onChange={(e) => handleChange("reward_token_symbol", e.target.value)} placeholder="e.g. SOL, USDC" />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount in Token</Label>
                  <Input type="number" value={form.reward_amount} onChange={(e) => handleChange("reward_amount", e.target.value)} placeholder="e.g. 10000" min={0} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Participants (optional)</Label>
                <Input type="number" value={form.max_participants} onChange={(e) => handleChange("max_participants", e.target.value)} placeholder="Leave empty for unlimited" min={1} />
              </div>

              {/* Leaderboard Tiers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Leaderboard Reward Tiers (min 10 positions)</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addTier} className="gap-1">
                    <Plus className="w-3 h-3" /> Add Tier
                  </Button>
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {form.leaderboard_tiers.map((tier, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge variant="secondary" className="shrink-0 min-w-[56px] justify-center text-xs">
                        {tier.rank_from === tier.rank_to ? `#${tier.rank_from}` : `#${tier.rank_from}-${tier.rank_to}`}
                      </Badge>
                      {tier.rank_from === tier.rank_to ? null : (
                        <span className="text-xs text-muted-foreground shrink-0">to</span>
                      )}
                      <Input
                        type="number"
                        value={tier.rank_to || ""}
                        onChange={(e) => updateTier(i, "rank_to", parseInt(e.target.value) || tier.rank_from)}
                        placeholder="End rank"
                        className="w-20 shrink-0"
                        min={tier.rank_from}
                      />
                      <Input
                        type="number"
                        value={tier.amount || ""}
                        onChange={(e) => updateTier(i, "amount", parseFloat(e.target.value) || 0)}
                        placeholder="Amount each"
                        className="flex-1"
                        min={0}
                      />
                      <span className="text-xs text-muted-foreground shrink-0">{form.reward_token_symbol || "tokens"}</span>
                      {form.leaderboard_tiers.length > 1 && (
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeTier(i)} className="shrink-0 h-8 w-8">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">
                    Covers {getTotalCoveredRanks()} position{getTotalCoveredRanks() !== 1 ? "s" : ""}
                    {getTotalCoveredRanks() < 10 && (
                      <span className="text-destructive ml-1">(need at least 10)</span>
                    )}
                  </span>
                  <span className="font-medium text-foreground">
                    Total: {getTotalTokens()} {form.reward_token_symbol || "tokens"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Internship Reward Fields ═══ */}
          {form.reward_type === "internship" && (
            <div className="space-y-4 bg-secondary/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground">Internship Details</h4>
              <Textarea
                value={form.internship_details}
                onChange={(e) => handleChange("internship_details", e.target.value)}
                placeholder="Describe the internship opportunity: role, duration, requirements, compensation..."
                rows={4}
              />
            </div>
          )}

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
