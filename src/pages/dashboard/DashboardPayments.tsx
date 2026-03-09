import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Wallet,
  CreditCard,
  Loader2,
  Globe,
  Check,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────
interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: string;
  method_label: string;
  method_value: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface PaymentPreferences {
  id: string;
  user_id: string;
  accepts_crypto: boolean;
  accepts_paypal: boolean;
  accepts_bank_transfer: boolean;
  preferred_method_id: string | null;
  region: string;
  created_at: string;
  updated_at: string;
}

// ── Constants ────────────────────────────────────────────────
const CRYPTO_METHODS = [
  { value: "solana", label: "Solana Address", placeholder: "Enter Solana wallet address" },
  { value: "usdc_base", label: "USDC on Base", placeholder: "Enter Base network wallet address" },
  { value: "ethereum", label: "Ethereum Address", placeholder: "Enter Ethereum wallet address" },
  { value: "bitcoin", label: "Bitcoin Address", placeholder: "Enter Bitcoin wallet address" },
];

const TRADITIONAL_METHODS = [
  { value: "paypal", label: "PayPal Email", placeholder: "Enter PayPal email address" },
  { value: "bank_transfer", label: "Bank Transfer", placeholder: "Enter bank account details" },
  { value: "wise", label: "Wise", placeholder: "Enter Wise email or account details" },
  { value: "payoneer", label: "Payoneer", placeholder: "Enter Payoneer email address" },
];

const ALL_METHODS = [...CRYPTO_METHODS, ...TRADITIONAL_METHODS];

const REGIONS = [
  { value: "global", label: "Global" },
  { value: "africa", label: "Africa" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
  { value: "remote_only", label: "Remote Only" },
];

const getMethodInfo = (type: string) =>
  ALL_METHODS.find((m) => m.value === type) ?? {
    value: type,
    label: type,
    placeholder: "Enter value",
  };

const isCrypto = (type: string) => CRYPTO_METHODS.some((m) => m.value === type);

// ── Main Component ───────────────────────────────────────────
const DashboardPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [prefs, setPrefs] = useState<PaymentPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  // Form state
  const [formType, setFormType] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formValue, setFormValue] = useState("");

  // ── Load data ──────────────────────────────────────────────
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: methodsData }, { data: prefsData }] = await Promise.all([
        (supabase as any)
          .from("payment_methods")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        (supabase as any)
          .from("payment_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      setMethods((methodsData ?? []) as PaymentMethod[]);
      setPrefs((prefsData ?? null) as PaymentPreferences | null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ── Ensure prefs row exists ────────────────────────────────
  const ensurePrefs = async (): Promise<PaymentPreferences | null> => {
    if (!user) return null;
    if (prefs) return prefs;
    const { data, error } = await (supabase as any)
      .from("payment_preferences")
      .insert({
        user_id: user.id,
        accepts_crypto: false,
        accepts_paypal: false,
        accepts_bank_transfer: false,
        region: "global",
      })
      .select()
      .single();
    if (error) return null;
    const newPrefs = data as PaymentPreferences;
    setPrefs(newPrefs);
    return newPrefs;
  };

  // ── Open add/edit dialog ──────────────────────────────────
  const openAdd = () => {
    setEditingMethod(null);
    setFormType("");
    setFormLabel("");
    setFormValue("");
    setDialogOpen(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setEditingMethod(m);
    setFormType(m.method_type);
    setFormLabel(m.method_label);
    setFormValue(m.method_value);
    setDialogOpen(true);
  };

  const handleTypeChange = (val: string) => {
    setFormType(val);
    setFormLabel(getMethodInfo(val).label);
    setFormValue("");
  };

  // ── Save method ────────────────────────────────────────────
  const handleSaveMethod = async () => {
    if (!user || !formType || !formValue.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editingMethod) {
        const { error } = await (supabase as any)
          .from("payment_methods")
          .update({ method_type: formType, method_label: formLabel, method_value: formValue.trim() })
          .eq("id", editingMethod.id);
        if (error) throw error;
        toast({ title: "Method updated" });
      } else {
        const isFirst = methods.length === 0;
        const { error } = await (supabase as any)
          .from("payment_methods")
          .insert({
            user_id: user.id,
            method_type: formType,
            method_label: formLabel,
            method_value: formValue.trim(),
            is_primary: isFirst,
          });
        if (error) throw error;
        toast({ title: "Payment method added" });
      }
      setDialogOpen(false);
      await loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete method ──────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("payment_methods")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;

      // If deleted preferred method, clear it in prefs
      if (prefs?.preferred_method_id === deleteTarget.id) {
        await (supabase as any)
          .from("payment_preferences")
          .update({ preferred_method_id: null })
          .eq("user_id", user!.id);
      }
      toast({ title: "Method removed" });
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Set primary ────────────────────────────────────────────
  const handleSetPrimary = async (m: PaymentMethod) => {
    if (!user || m.is_primary) return;
    try {
      // Clear all primaries then set new one
      await (supabase as any)
        .from("payment_methods")
        .update({ is_primary: false })
        .eq("user_id", user.id);
      await (supabase as any)
        .from("payment_methods")
        .update({ is_primary: true })
        .eq("id", m.id);
      setMethods((prev) =>
        prev.map((x) => ({ ...x, is_primary: x.id === m.id }))
      );
      toast({ title: "Primary method updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Set preferred ──────────────────────────────────────────
  const handleSetPreferred = async (methodId: string) => {
    if (!user) return;
    try {
      const currentPrefs = await ensurePrefs();
      if (!currentPrefs) return;
      const { error } = await (supabase as any)
        .from("payment_preferences")
        .update({ preferred_method_id: methodId })
        .eq("user_id", user.id);
      if (error) throw error;
      setPrefs((p) => p ? { ...p, preferred_method_id: methodId } : p);
      toast({ title: "Preferred method saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Update visibility prefs ────────────────────────────────
  const handlePrefsChange = async (updates: Partial<PaymentPreferences>) => {
    if (!user) return;
    try {
      const currentPrefs = await ensurePrefs();
      if (!currentPrefs) return;
      const { error } = await (supabase as any)
        .from("payment_preferences")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;
      setPrefs((p) => p ? { ...p, ...updates } : p);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cryptoMethods = methods.filter((m) => isCrypto(m.method_type));
  const traditionalMethods = methods.filter((m) => !isCrypto(m.method_type));

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your payout methods and payment visibility on the Talent Marketplace.
        </p>
      </div>

      {/* ── Section 1: Payment Methods ─────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Payment Methods</h2>
            <p className="text-xs text-muted-foreground">Add your payout addresses and accounts.</p>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Method
          </Button>
        </div>

        {methods.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No payment methods added yet.</p>
            <Button variant="ghost" size="sm" onClick={openAdd} className="mt-3 gap-2">
              <Plus className="w-4 h-4" />
              Add your first method
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cryptoMethods.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Wallet className="w-3.5 h-3.5" />
                  Crypto Wallets
                </div>
                {cryptoMethods.map((m) => (
                  <MethodRow
                    key={m.id}
                    method={m}
                    onEdit={() => openEdit(m)}
                    onDelete={() => setDeleteTarget(m)}
                    onSetPrimary={() => handleSetPrimary(m)}
                  />
                ))}
              </div>
            )}
            {traditionalMethods.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5" />
                  Traditional Payments
                </div>
                {traditionalMethods.map((m) => (
                  <MethodRow
                    key={m.id}
                    method={m}
                    onEdit={() => openEdit(m)}
                    onDelete={() => setDeleteTarget(m)}
                    onSetPrimary={() => handleSetPrimary(m)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Section 2: Preferred Payment Method ───────────── */}
      <section className="space-y-3 border-t border-border pt-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Preferred Payment Method</h2>
          <p className="text-xs text-muted-foreground">Select your preferred way to receive payments.</p>
        </div>
        {methods.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Add payment methods above to set a preference.</p>
        ) : (
          <div className="grid gap-2">
            {methods.map((m) => {
              const isPreferred = prefs?.preferred_method_id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSetPreferred(m.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-colors ${
                    isPreferred
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isPreferred ? "border-primary" : "border-muted-foreground"
                  }`}>
                    {isPreferred && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.method_label}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.method_value}</p>
                  </div>
                  {m.is_primary && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Primary</Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Section 3: Payment Visibility ─────────────────── */}
      <section className="space-y-4 border-t border-border pt-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Payment Visibility</h2>
          <p className="text-xs text-muted-foreground">
            Control which payment options appear on your public Talent Marketplace profile.
          </p>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="Accepts Crypto"
            description="Show crypto as an accepted payment on your profile"
            checked={prefs?.accepts_crypto ?? false}
            onCheckedChange={(v) => handlePrefsChange({ accepts_crypto: v })}
          />
          <ToggleRow
            label="Accepts PayPal"
            description="Show PayPal as an accepted payment on your profile"
            checked={prefs?.accepts_paypal ?? false}
            onCheckedChange={(v) => handlePrefsChange({ accepts_paypal: v })}
          />
          <ToggleRow
            label="Accepts Bank Transfer"
            description="Show bank transfer as an accepted payment on your profile"
            checked={prefs?.accepts_bank_transfer ?? false}
            onCheckedChange={(v) => handlePrefsChange({ accepts_bank_transfer: v })}
          />
        </div>

        {/* Region */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Your Region
          </Label>
          <Select
            value={prefs?.region ?? "global"}
            onValueChange={(v) => handlePrefsChange({ region: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Helps clients find talent in their region or timezone.
          </p>
        </div>
      </section>

      {/* ── Add/Edit Dialog ────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Method Type</Label>
              <Select value={formType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a payment method" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Crypto Wallets
                  </div>
                  {CRYPTO_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Traditional Payments
                  </div>
                  {TRADITIONAL_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formType && (
              <div className="space-y-2">
                <Label>Display Label</Label>
                <Input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. My Solana Wallet"
                  maxLength={60}
                />
              </div>
            )}

            {formType && (
              <div className="space-y-2">
                <Label>{getMethodInfo(formType).label} Value</Label>
                <Input
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder={getMethodInfo(formType).placeholder}
                  maxLength={200}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMethod} disabled={saving || !formType || !formValue.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingMethod ? "Save Changes" : "Add Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.method_label}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────

interface MethodRowProps {
  method: PaymentMethod;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}

const MethodRow = ({ method, onEdit, onDelete, onSetPrimary }: MethodRowProps) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">{method.method_label}</p>
        {method.is_primary && (
          <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
            Primary
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">{method.method_value}</p>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      {!method.is_primary && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          title="Set as Primary"
          onClick={onSetPrimary}
        >
          <Star className="w-4 h-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Edit"
        onClick={onEdit}
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        title="Remove"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}

const ToggleRow = ({ label, description, checked, onCheckedChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default DashboardPayments;
