import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Package, Filter, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { productCategories, productCategoryLabels } from "@/data/productsData";
import {
  useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useAdminOrders,
  formatPrice, type DBProduct,
} from "@/hooks/useProducts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const emptyProduct = {
  title: "", description: "", category: "tools", price: 0, currency: "NGN",
  image_url: "", creator_name: "", download_url: "", viewer_url: "",
  is_published: false, coming_soon: false, allow_download: true,
};

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<DBProduct> | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingViewer, setUploadingViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerInputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useAdminProducts();
  const { data: orders = [] } = useAdminOrders();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (p: DBProduct) => {
    setEditingProduct(p);
    setForm({
      title: p.title, description: p.description || "", category: p.category,
      price: p.price, currency: p.currency, image_url: p.image_url || "",
      creator_name: p.creator_name, download_url: p.download_url || "",
      viewer_url: (p as any).viewer_url || "",
      is_published: p.is_published, coming_soon: p.coming_soon,
      allow_download: (p as any).allow_download !== false,
    });
    setDialogOpen(true);
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-files").upload(filePath, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("product-files").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleFileUpload = async (file: File, type: "download" | "viewer") => {
    const setter = type === "download" ? setUploadingFile : setUploadingViewer;
    setter(true);
    const url = await uploadFile(file, type === "download" ? "downloads" : "viewers");
    if (url) {
      setForm((prev) => ({ ...prev, [type === "download" ? "download_url" : "viewer_url"]: url }));
      toast.success(`${type === "download" ? "Product file" : "Viewer file"} uploaded`);
    }
    setter(false);
  };

  const handleSave = () => {
    const payload = { ...form, price: Number(form.price) };
    if (editingProduct?.id) {
      updateProduct.mutate({ id: editingProduct.id, ...payload } as any, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      createProduct.mutate(payload as any, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) deleteProduct.mutate(id);
  };

  const successOrders = orders.filter((o) => o.status === "success");
  const totalRevenue = successOrders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground mt-1">Manage digital products and orders</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {productCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{productCategoryLabels[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredProducts.length} products</Badge>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12">Loading...</TableCell></TableRow>
                ) : filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{product.creator_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{productCategoryLabels[product.category as keyof typeof productCategoryLabels] || product.category}</Badge></TableCell>
                    <TableCell><span className="font-medium">{formatPrice(product.price, product.currency)}</span></TableCell>
                    <TableCell>{product.downloads_count}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.is_published ? <Badge variant="default">Published</Badge> : <Badge variant="secondary">Draft</Badge>}
                        {product.coming_soon && <Badge variant="outline">Soon</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => updateProduct.mutate({ id: product.id, is_published: !product.is_published })}>
                          {product.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredProducts.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No products found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-green-600">{successOrders.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.products?.title || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{order.email}</TableCell>
                    <TableCell>{formatPrice(order.amount, order.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "success" ? "default" : order.status === "pending" ? "secondary" : "destructive"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No orders yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {productCategories.filter((c) => c !== "all").map((cat) => (
                      <SelectItem key={cat} value={cat}>{productCategoryLabels[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Price (kobo)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Creator Name</Label><Input value={form.creator_name} onChange={(e) => setForm({ ...form, creator_name: e.target.value })} /></div>
            <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
            <div>
              <Label>Product File (for download)</Label>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.zip,.epub,.doc,.docx" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "download"); }} />
              <div className="flex items-center gap-2 mt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}>
                  {uploadingFile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingFile ? "Uploading..." : "Upload File"}
                </Button>
                {form.download_url && <span className="text-xs text-muted-foreground truncate max-w-[200px]">✓ File uploaded</span>}
              </div>
            </div>
            <div>
              <Label>Viewer File (for in-platform reading)</Label>
              <input type="file" ref={viewerInputRef} className="hidden" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "viewer"); }} />
              <div className="flex items-center gap-2 mt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => viewerInputRef.current?.click()} disabled={uploadingViewer}>
                  {uploadingViewer ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploadingViewer ? "Uploading..." : "Upload Viewer PDF"}
                </Button>
                {form.viewer_url && <span className="text-xs text-muted-foreground truncate max-w-[200px]">✓ Viewer uploaded</span>}
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.coming_soon} onCheckedChange={(v) => setForm({ ...form, coming_soon: v })} />
                <Label>Coming Soon</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.allow_download} onCheckedChange={(v) => setForm({ ...form, allow_download: v })} />
                <Label>Allow Download</Label>
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!form.title || createProduct.isPending || updateProduct.isPending}>
              {editingProduct ? "Update" : "Create"} Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
