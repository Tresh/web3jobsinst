import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  DollarSign,
  Users,
  Clock,
  Info,
} from "lucide-react";

type BootcampType = "free" | "paid";
type PricingModel = "fixed_fee" | "revenue_share";

interface BootcampFormData {
  title: string;
  description: string;
  duration: string;
  bootcampType: BootcampType;
  pricingModel: PricingModel;
  maxParticipants: string;
  priceAmount: string;
}

const PRICING_TIERS = {
  free: {
    "100": 10,
    "500": 25,
    "1000": 50,
  },
  paid_fixed: {
    "100": 50,
    "500": 100,
    "1000": 200,
  },
  paid_revenue: {
    "100": { upfront: 20, share: 10 },
    "500": { upfront: 50, share: 8 },
    "1000": { upfront: 100, share: 5 },
  },
};

const BootcampCreate = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BootcampFormData>({
    title: "",
    description: "",
    duration: "20",
    bootcampType: "free",
    pricingModel: "fixed_fee",
    maxParticipants: "100",
    priceAmount: "",
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateForm = (field: keyof BootcampFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getPlatformFee = () => {
    if (formData.bootcampType === "free") {
      return PRICING_TIERS.free[formData.maxParticipants as keyof typeof PRICING_TIERS.free] || 10;
    }
    if (formData.pricingModel === "fixed_fee") {
      return PRICING_TIERS.paid_fixed[formData.maxParticipants as keyof typeof PRICING_TIERS.paid_fixed] || 50;
    }
    return PRICING_TIERS.paid_revenue[formData.maxParticipants as keyof typeof PRICING_TIERS.paid_revenue] || { upfront: 20, share: 10 };
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.trim().length >= 5 && formData.description.trim().length >= 20;
      case 2:
        return true;
      case 3:
        if (formData.bootcampType === "paid") {
          return parseFloat(formData.priceAmount) > 0;
        }
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const platformFee = getPlatformFee();
      const { error } = await supabase.from("bootcamps").insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration_days: parseInt(formData.duration),
        host_user_id: user.id,
        host_name: profile?.full_name || "Unknown Host",
        bootcamp_type: formData.bootcampType,
        pricing_model: formData.bootcampType === "paid" ? formData.pricingModel : null,
        price_amount: formData.bootcampType === "paid" ? parseFloat(formData.priceAmount) : null,
        platform_fee: typeof platformFee === "number" ? platformFee : platformFee.upfront,
        revenue_share_percent: formData.bootcampType === "paid" && formData.pricingModel === "revenue_share" 
          ? (platformFee as { upfront: number; share: number }).share 
          : null,
        max_participants: parseInt(formData.maxParticipants),
        status: "pending_approval",
      });

      if (error) throw error;

      toast.success("Bootcamp submitted for approval!", {
        description: "We'll review your bootcamp and get back to you soon.",
      });
      navigate("/bootcamps");
    } catch (err: any) {
      toast.error("Failed to create bootcamp", {
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <main className="pt-20 px-4">
          <div className="max-w-2xl mx-auto py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Login Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to create a bootcamp.
            </p>
            <Link to="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      <main className="pt-20 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/bootcamps" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bootcamps
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create Your Bootcamp</h1>
            <p className="text-muted-foreground">
              Set up your bootcamp and start teaching
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Bootcamp Details</CardTitle>
                  <CardDescription>
                    Give your bootcamp a compelling title and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Bootcamp Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., 20 Days Content Mastery Bootcamp"
                      value={formData.title}
                      onChange={(e) => updateForm("title", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 5 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what participants will learn and achieve..."
                      value={formData.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 20 characters. Be specific about the value you'll provide.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(v) => updateForm("duration", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="20">20 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Bootcamp Type</CardTitle>
                  <CardDescription>
                    Choose whether your bootcamp is free or paid
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={formData.bootcampType}
                    onValueChange={(v) => updateForm("bootcampType", v as BootcampType)}
                    className="space-y-4"
                  >
                    <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.bootcampType === "free" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}>
                      <RadioGroupItem value="free" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Free Bootcamp</span>
                          <Badge variant="outline" className="border-green-500 text-green-500">Free</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Participants join for free. You pay a platform fee based on max participants.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.bootcampType === "paid" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}>
                      <RadioGroupItem value="paid" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Paid Bootcamp</span>
                          <Badge variant="outline" className="border-amber-500 text-amber-500">Paid</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Charge participants to join. Choose between fixed fee or revenue share.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label>Maximum Participants</Label>
                    <Select
                      value={formData.maxParticipants}
                      onValueChange={(v) => updateForm("maxParticipants", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">Up to 100 participants</SelectItem>
                        <SelectItem value="500">Up to 500 participants</SelectItem>
                        <SelectItem value="1000">Up to 1,000 participants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>
                    {formData.bootcampType === "free" 
                      ? "Review platform fees for free bootcamps"
                      : "Set your pricing and review platform fees"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.bootcampType === "free" ? (
                  <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Platform Fee</p>
                          <p className="text-2xl font-bold text-primary">
                            ${(() => {
                              const fee = getPlatformFee();
                              return typeof fee === "number" ? fee : fee.upfront;
                            })()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        One-time fee to host your free bootcamp with up to {formData.maxParticipants} participants.
                      </p>
                    </div>
                  ) : (
                    <>
                      <RadioGroup
                        value={formData.pricingModel}
                        onValueChange={(v) => updateForm("pricingModel", v as PricingModel)}
                        className="space-y-4"
                      >
                        <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.pricingModel === "fixed_fee" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}>
                          <RadioGroupItem value="fixed_fee" className="mt-1" />
                          <div className="flex-1">
                            <span className="font-medium">Fixed Platform Fee</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              Pay ${PRICING_TIERS.paid_fixed[formData.maxParticipants as keyof typeof PRICING_TIERS.paid_fixed]} upfront. Keep 100% of participant fees.
                            </p>
                          </div>
                        </label>

                        <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.pricingModel === "revenue_share" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}>
                          <RadioGroupItem value="revenue_share" className="mt-1" />
                          <div className="flex-1">
                            <span className="font-medium">Revenue Share</span>
                            {(() => {
                              const tier = PRICING_TIERS.paid_revenue[formData.maxParticipants as keyof typeof PRICING_TIERS.paid_revenue];
                              return (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Pay ${tier.upfront} upfront + {tier.share}% of participant fees.
                                </p>
                              );
                            })()}
                          </div>
                        </label>
                      </RadioGroup>

                      <div className="space-y-2">
                        <Label htmlFor="price">Participant Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="29.99"
                          value={formData.priceAmount}
                          onChange={(e) => updateForm("priceAmount", e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>
                      Payment processing will be handled manually. Contact admin after approval to complete payment.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>
                    Review your bootcamp details before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium text-right">{formData.title}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{formData.duration} Days</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="outline">
                        {formData.bootcampType === "free" ? "Free" : "Paid"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Max Participants</span>
                      <span className="font-medium">{formData.maxParticipants}</span>
                    </div>
                    {formData.bootcampType === "paid" && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Participant Price</span>
                        <span className="font-medium">${formData.priceAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span className="font-medium">
                        {(() => {
                          const fee = getPlatformFee();
                          if (typeof fee === "number") {
                            return `$${fee}`;
                          }
                          const shareText = formData.bootcampType === "paid" && formData.pricingModel === "revenue_share"
                            ? ` + ${fee.share}%`
                            : "";
                          return `$${fee.upfront}${shareText}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Host</span>
                      <span className="font-medium">{profile?.full_name || "You"}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
                    <p className="font-medium mb-1">What happens next?</p>
                    <p>Your bootcamp will be submitted for admin approval. Once approved, you can add tasks and open registration.</p>
                  </div>
                </CardContent>
              </>
            )}

            {/* Navigation */}
            <CardContent className="pt-0">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {step < totalSteps ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canProceed()}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit for Approval"}
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BootcampCreate;
