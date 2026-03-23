import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Package, Plus, Edit, Eye, EyeOff, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatPrice, type DBProduct } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const DashboardProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "templates",
    price: "0",
    currency: "NGN",
  });

  // Fetch products created by this user
  const { data: myProducts = [], isLoading } = useQuery({
    queryKey: ["my-created-products", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBProduct[];
    },
  });

  const submitProduct = useMutation({
    mutationFn: async (product: Partial<DBProduct>) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-created-products"] });
      toast({ title: "Product submitted for review!" });
      setCreateOpen(false);
      setForm({ title: "", description: "", category: "templates", price: "0", currency: "NGN" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    submitProduct.mutate({
      title: form.title,
      description: form.description,
      category: form.category,
      price: Math.round(parseFloat(form.price || "0") * 100),
      currency: form.currency,
      creator_user_id: user!.id,
      creator_name: user!.user_metadata?.full_name || user!.email || "Creator",
      is_published: false,
      coming_soon: false,
    });
  };

  const getStatusBadge = (product: DBProduct) => {
    if (product.is_published) {
      return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground mt-1">Create and manage your digital products</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Create Product
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : myProducts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mb-2">No products yet</CardTitle>
            <CardDescription className="text-center max-w-sm mb-6">
              Create your first digital product — ebooks, templates, bots, tools — and submit it for review.
              Once approved, it'll be listed on the marketplace.
            </CardDescription>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.image_url ? (
                <div className="aspect-video bg-secondary overflow-hidden">
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-secondary flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-1 flex-1">{product.title}</h3>
                  {getStatusBadge(product)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(product.price, product.currency)} · {product.downloads_count} downloads
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Product Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit a Product</DialogTitle>
            <DialogDescription>
              Fill in the details below. Your product will be reviewed by an admin before publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Web3 Job Hunting Guide" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." rows={4} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="ebooks">Ebooks</SelectItem>
                  <SelectItem value="ai-tools">AI Tools</SelectItem>
                  <SelectItem value="telegram-bots">Telegram Bots</SelectItem>
                  <SelectItem value="courses">Courses</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Suggested Price (₦) — Admin may adjust</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0 for free" min="0" />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={submitProduct.isPending}>
              {submitProduct.isPending ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardProducts;
