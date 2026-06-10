import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Store, CheckCircle, XCircle, Clock, Star, Tag, Plus, Pencil, Trash2, Eye, Package, BarChart2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";

const MARKETPLACE_EMAIL = "marketplace@royalgms.com";
const MARKETPLACE_NAME = "Royal Marketplace";

function sendMarketplaceMail(to, subject, html) {
  return base44.functions.invoke("sendEmail", {
    to, subject, html,
    from_name: MARKETPLACE_NAME,
    from_email: MARKETPLACE_EMAIL,
  }).catch(() => {});
}

const emptyVendorForm = {
  business_name: "", owner_full_name: "", email: "", phone: "",
  category_id: "", category_name: "", description: "", services_products: "",
  website: "", location_address: "", location_city: "", location_state: "",
  price_range: "", opening_hours: "", social_facebook: "", social_instagram: "",
  social_twitter: "", social_whatsapp: "", logo_url: "", cover_image_url: "",
  approval_status: "Approved", featured: false,
};

const emptyProductForm = {
  name: "", description: "", price: "", discount_percent: 0,
  unit: "", is_available: true, is_featured: false, image_urls: [],
};

export default function AdminMarketplace() {
  const queryClient = useQueryClient();
  const [approvalFilter, setApprovalFilter] = useState("Pending");

  // Dialogs & state
  const [reviewVendor, setReviewVendor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "", description: "", slug: "", sort_order: 0, is_active: true });
  const [vendorDialog, setVendorDialog] = useState(null); // null | 'new' | vendor obj
  const [vendorForm, setVendorForm] = useState(emptyVendorForm);
  const [productDialog, setProductDialog] = useState(null); // null | { vendorId, product? }
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);

  // Confirm dialog state
  const [confirm, setConfirm] = useState(null); // { title, description, onConfirm }

  const { data: vendors = [] } = useQuery({
    queryKey: ["all_vendors"],
    queryFn: () => base44.entities.Vendor.list("-created_date", 500),
  });

  const { data: categories = [], refetch: refetchCats } = useQuery({
    queryKey: ["all_categories"],
    queryFn: () => base44.entities.MarketplaceCategory.list("sort_order", 100),
  });

  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ["all_admin_products"],
    queryFn: () => base44.entities.VendorProduct.list("-created_date", 500),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["all_reviews"],
    queryFn: () => base44.entities.VendorReview.list("-created_date", 200),
  });

  // --- Helpers ---
  const ask = (title, description, onConfirm) => setConfirm({ title, description, onConfirm });

  // --- Vendor Actions ---
  const approveVendor = async (v) => {
    await base44.entities.Vendor.update(v.id, { approval_status: "Approved" });
    sendMarketplaceMail(v.email, "Your Royal Marketplace Listing is Approved!",
      `<p>Congratulations <strong>${v.business_name}</strong>!</p><p>Your listing on the Royal Marketplace has been approved and is now live.</p><p>Login to your <a href="${window.location.origin}/marketplace/vendor-dashboard">Vendor Dashboard</a> to manage your listing.</p><p>${MARKETPLACE_NAME}<br/>Warri Kingdom</p>`
    );
    queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
    toast.success("Vendor approved and notified");
    setReviewVendor(null);
  };

  const rejectVendor = async (v) => {
    await base44.entities.Vendor.update(v.id, { approval_status: "Rejected", rejection_reason: rejectReason });
    sendMarketplaceMail(v.email, "Royal Marketplace Registration Update",
      `<p>Dear ${v.owner_full_name},</p><p>We regret to inform you that your application for <strong>${v.business_name}</strong> has not been approved at this time.</p>${rejectReason ? `<p><strong>Reason:</strong> ${rejectReason}</p>` : ""}<p>You may re-apply after addressing the noted issues.</p><p>${MARKETPLACE_NAME}<br/>Warri Kingdom</p>`
    );
    queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
    toast.success("Vendor rejected and notified");
    setRejectReason("");
    setReviewVendor(null);
  };

  const toggleFeatured = (v) => ask(
    v.featured ? "Remove from Featured?" : "Mark as Featured?",
    v.featured ? `Remove ${v.business_name} from featured listings?` : `${v.business_name} will appear prominently in the marketplace.`,
    async () => {
      await base44.entities.Vendor.update(v.id, { featured: !v.featured });
      queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
      toast.success(v.featured ? "Removed from featured" : "Marked as featured");
    }
  );

  const toggleSuspend = (v) => {
    const isSuspended = v.approval_status === "Suspended";
    ask(
      isSuspended ? "Reinstate Vendor?" : "Suspend Vendor?",
      isSuspended ? `Reinstate ${v.business_name} and restore their listing?` : `Suspend ${v.business_name}? Their listing will be hidden from the public.`,
      async () => {
        const newStatus = isSuspended ? "Approved" : "Suspended";
        await base44.entities.Vendor.update(v.id, { approval_status: newStatus });
        queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
        toast.success(newStatus === "Suspended" ? "Vendor suspended" : "Vendor reinstated");
      }
    );
  };

  const deleteVendor = (v) => ask(
    "Delete Vendor?",
    `Permanently delete ${v.business_name}? This cannot be undone.`,
    async () => {
      await base44.entities.Vendor.delete(v.id);
      queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
      toast.success("Vendor deleted");
    }
  );

  // Save vendor (add or edit)
  const saveVendor = async () => {
    if (!vendorForm.business_name || !vendorForm.owner_full_name || !vendorForm.email || !vendorForm.phone) {
      toast.error("Business name, owner, email and phone are required");
      return;
    }
    const isEdit = vendorDialog?.id;
    if (isEdit) {
      await base44.entities.Vendor.update(vendorDialog.id, vendorForm);
      toast.success("Vendor updated");
    } else {
      await base44.entities.Vendor.create({
        ...vendorForm,
        email_verified: true,
        approval_status: vendorForm.approval_status || "Approved",
      });
      if (vendorForm.email) {
        sendMarketplaceMail(vendorForm.email, "Your Royal Marketplace Listing has been created",
          `<p>Dear ${vendorForm.owner_full_name},</p><p>Your business <strong>${vendorForm.business_name}</strong> has been added to the Royal Marketplace by the admin team.</p><p>Visit your <a href="${window.location.origin}/marketplace/vendor-dashboard">Vendor Dashboard</a> to manage your listing.</p><p>${MARKETPLACE_NAME}<br/>Warri Kingdom</p>`
        );
      }
      toast.success("Vendor created and notified");
    }
    queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
    setVendorDialog(null);
  };

  // --- Product Actions ---
  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) { toast.error("Name and price are required"); return; }
    const vendorId = productDialog?.vendorId;
    const vendorName = vendors.find(v => v.id === vendorId)?.business_name || "";
    const data = {
      ...productForm, price: parseFloat(productForm.price),
      vendor_id: vendorId, vendor_name: vendorName,
    };
    if (data.discount_percent > 0) data.discounted_price = data.price * (1 - data.discount_percent / 100);
    if (productDialog?.product?.id) {
      await base44.entities.VendorProduct.update(productDialog.product.id, data);
      toast.success("Product updated");
    } else {
      await base44.entities.VendorProduct.create(data);
      toast.success("Product added");
    }
    refetchProducts();
    setProductDialog(null);
    setProductForm(emptyProductForm);
  };

  const deleteProduct = (p) => ask(
    "Delete Product?",
    `Delete "${p.name}"? This cannot be undone.`,
    async () => {
      await base44.entities.VendorProduct.delete(p.id);
      refetchProducts();
      toast.success("Product deleted");
    }
  );

  // --- Review Actions ---
  const approveReview = (r) => ask(
    "Approve Review?",
    `Make this review by ${r.reviewer_name} publicly visible?`,
    async () => {
      await base44.entities.VendorReview.update(r.id, { is_approved: true });
      queryClient.invalidateQueries({ queryKey: ["all_reviews"] });
      toast.success("Review approved");
    }
  );

  const deleteReview = (r) => ask(
    "Delete Review?",
    `Delete this review by ${r.reviewer_name}? This cannot be undone.`,
    async () => {
      await base44.entities.VendorReview.delete(r.id);
      queryClient.invalidateQueries({ queryKey: ["all_reviews"] });
      toast.success("Review deleted");
    }
  );

  // --- Category Actions ---
  const saveCategory = async () => {
    if (!catForm.name) { toast.error("Category name is required"); return; }
    if (categoryDialog?.id) {
      await base44.entities.MarketplaceCategory.update(categoryDialog.id, catForm);
      toast.success("Category updated");
    } else {
      await base44.entities.MarketplaceCategory.create({ ...catForm, slug: catForm.name.toLowerCase().replace(/\s+/g, "-") });
      toast.success("Category created");
    }
    refetchCats();
    setCategoryDialog(null);
    setCatForm({ name: "", icon: "", description: "", slug: "", sort_order: 0, is_active: true });
  };

  const deleteCategory = (c) => ask(
    "Delete Category?",
    `Delete category "${c.name}"? This cannot be undone.`,
    async () => {
      await base44.entities.MarketplaceCategory.delete(c.id);
      refetchCats();
      toast.success("Category deleted");
    }
  );

  // --- File Uploads ---
  const uploadFile = async (file, setLoading, key) => {
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setVendorForm(f => ({ ...f, [key]: file_url }));
    setLoading(false);
  };

  const uploadProductImg = async (file) => {
    setUploadingProductImg(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProductForm(f => ({ ...f, image_urls: [...(f.image_urls || []), file_url] }));
    setUploadingProductImg(false);
  };

  const filteredVendors = vendors.filter(v => approvalFilter === "all" ? true : v.approval_status === approvalFilter);

  const metrics = {
    total: vendors.length,
    approved: vendors.filter(v => v.approval_status === "Approved").length,
    pending: vendors.filter(v => v.approval_status === "Pending").length,
    featured: vendors.filter(v => v.featured).length,
    products: products.length,
    reviews: reviews.length,
    pendingReviews: reviews.filter(r => !r.is_approved).length,
  };

  const statusColor = {
    Approved: "text-emerald-600 border-emerald-300 bg-emerald-50",
    Pending: "text-amber-600 border-amber-300 bg-amber-50",
    Rejected: "text-red-600 border-red-300 bg-red-50",
    Suspended: "text-gray-600 border-gray-300 bg-gray-50"
  };

  return (
    <div>
      <PageHeader title="Marketplace Management" subtitle="Manage vendors, categories, approvals and reviews">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => { setVendorForm(emptyVendorForm); setVendorDialog("new"); }}>
            <Plus className="w-4 h-4 mr-1" />Add Vendor
          </Button>
          <Button size="sm" onClick={() => { setCatForm({ name: "", icon: "🏪", description: "", sort_order: 0, is_active: true }); setCategoryDialog("new"); }}>
            <Plus className="w-4 h-4 mr-1" />Add Category
          </Button>
        </div>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { label: "Total Vendors", value: metrics.total, icon: <Store className="w-4 h-4 text-primary" /> },
          { label: "Approved", value: metrics.approved, icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
          { label: "Pending", value: metrics.pending, icon: <Clock className="w-4 h-4 text-amber-500" /> },
          { label: "Featured", value: metrics.featured, icon: <Star className="w-4 h-4 text-amber-400" /> },
          { label: "Products", value: metrics.products, icon: <Package className="w-4 h-4 text-blue-500" /> },
          { label: "Reviews", value: metrics.reviews, icon: <BarChart2 className="w-4 h-4 text-purple-500" /> },
          { label: "Pending Reviews", value: metrics.pendingReviews, icon: <Clock className="w-4 h-4 text-orange-500" /> },
        ].map(m => (
          <div key={m.label} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">{m.icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</span></div>
            <p className="font-heading text-2xl font-semibold">{m.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="vendors">
        <TabsList className="mb-6">
          <TabsTrigger value="vendors"><Store className="w-4 h-4 mr-1" />Vendors</TabsTrigger>
          <TabsTrigger value="products"><Package className="w-4 h-4 mr-1" />Products</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-1" />Categories</TabsTrigger>
          <TabsTrigger value="reviews"><Star className="w-4 h-4 mr-1" />Reviews {metrics.pendingReviews > 0 && <Badge className="ml-1 h-4 min-w-4 text-[9px] bg-amber-500">{metrics.pendingReviews}</Badge>}</TabsTrigger>
        </TabsList>

        {/* Vendors Tab */}
        <TabsContent value="vendors">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {["all", "Pending", "Approved", "Rejected", "Suspended"].map(s => (
              <Button key={s} size="sm" variant={approvalFilter === s ? "default" : "outline"} onClick={() => setApprovalFilter(s)} className="capitalize">
                {s === "all" ? "All" : s}
                {s !== "all" && <Badge variant="outline" className="ml-1 text-[9px]">{vendors.filter(v => v.approval_status === s).length}</Badge>}
              </Button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredVendors.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No vendors found.</p>
            ) : filteredVendors.map(v => (
              <div key={v.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {v.logo_url ? (
                    <img src={v.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 text-2xl">🏪</div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm truncate">{v.business_name}</p>
                      {v.featured && <Badge className="text-[9px] bg-accent text-accent-foreground">⭐ Featured</Badge>}
                      <Badge variant="outline" className={`text-[9px] ${statusColor[v.approval_status]}`}>{v.approval_status}</Badge>
                      {!v.email_verified && <Badge variant="outline" className="text-[9px] text-orange-600 border-orange-300">Email Unverified</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{v.owner_full_name} · {v.email} · {v.category_name}</p>
                    <p className="text-xs text-muted-foreground">{v.location_city}{v.location_state ? `, ${v.location_state}` : ""} · {format(new Date(v.created_date), "dd MMM yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {v.approval_status === "Pending" && (
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => ask("Approve Vendor?", `Approve ${v.business_name} and notify them by email?`, () => approveVendor(v))}>
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setReviewVendor(v)}>
                    <Eye className="w-3 h-3 mr-1" />Review
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs"
                    onClick={() => { setVendorForm({ ...emptyVendorForm, ...v }); setVendorDialog(v); }}>
                    <Pencil className="w-3 h-3 mr-1" />Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleFeatured(v)}>
                    <Star className="w-3 h-3 mr-1" />{v.featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button size="sm" variant="outline" className={`h-7 text-xs ${v.approval_status === "Suspended" ? "text-emerald-600" : "text-orange-600"}`}
                    onClick={() => toggleSuspend(v)}>
                    {v.approval_status === "Suspended" ? "Reinstate" : "Suspend"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteVendor(v)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{products.length} total products across all vendors</p>
            <Button size="sm" onClick={() => { setProductForm(emptyProductForm); setProductDialog({ vendorId: null }); }}>
              <Plus className="w-4 h-4 mr-1" />Add Product
            </Button>
          </div>
          <div className="space-y-3">
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No products yet.</p>
            ) : products.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                {p.image_urls?.[0] && <img src={p.image_urls[0]} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.vendor_name} · ₦{p.price?.toLocaleString()}{p.unit ? ` / ${p.unit}` : ""}</p>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => { setProductForm({ ...p, price: p.price?.toString() || "" }); setProductDialog({ vendorId: p.vendor_id, product: p }); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteProduct(p)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <span className="text-3xl">{c.icon || "🏪"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.description}</p>
                  <Badge variant="outline" className={`text-[9px] mt-1 ${c.is_active ? "text-emerald-600 border-emerald-300" : "text-gray-500"}`}>{c.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => { setCatForm({ name: c.name, icon: c.icon, description: c.description, slug: c.slug, sort_order: c.sort_order || 0, is_active: c.is_active }); setCategoryDialog(c); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(c)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <button onClick={() => { setCatForm({ name: "", icon: "🏪", description: "", sort_order: 0, is_active: true }); setCategoryDialog("new"); }}
              className="border-2 border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
              <Plus className="w-5 h-5" /><span className="text-sm">Add Category</span>
            </button>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No reviews yet.</p>
            ) : reviews.map(r => (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sm">{r.reviewer_name}</p>
                    <Badge variant="outline" className="text-[9px]">{r.vendor_name}</Badge>
                    {!r.is_approved && <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-400">Pending Approval</Badge>}
                    {r.is_approved && <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-400">Approved</Badge>}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-xs ${i < r.rating ? "text-amber-400" : "text-muted-foreground/30"}`}>★</span>
                    ))}
                  </div>
                  {r.title && <p className="text-sm font-medium">{r.title}</p>}
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!r.is_approved && (
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => approveReview(r)}>
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => deleteReview(r)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Global Confirm Dialog */}
      <AlertDialog open={!!confirm} onOpenChange={o => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { confirm?.onConfirm(); setConfirm(null); }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Vendor Review Dialog */}
      <Dialog open={!!reviewVendor} onOpenChange={o => !o && setReviewVendor(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Review Vendor Application</DialogTitle>
          </DialogHeader>
          {reviewVendor && (
            <div className="space-y-4 text-sm">
              {reviewVendor.cover_image_url && <img src={reviewVendor.cover_image_url} alt="" className="w-full h-36 object-cover rounded-xl" />}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Business Name", reviewVendor.business_name],
                  ["Owner", reviewVendor.owner_full_name],
                  ["Category", reviewVendor.category_name],
                  ["Email", reviewVendor.email],
                  ["Phone", reviewVendor.phone],
                  ["City", reviewVendor.location_city],
                  ["State", reviewVendor.location_state],
                  ["Price Range", reviewVendor.price_range],
                  ["Email Verified", reviewVendor.email_verified ? "✓ Yes" : "✗ No"],
                ].map(([l, v]) => v ? (
                  <div key={l}><p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p><p className="font-medium">{v}</p></div>
                ) : null)}
              </div>
              {reviewVendor.description && <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Description</p><p className="text-muted-foreground">{reviewVendor.description}</p></div>}
              {reviewVendor.services_products && <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Services/Products</p><p className="text-muted-foreground whitespace-pre-line">{reviewVendor.services_products}</p></div>}
              {reviewVendor.reg_document_url && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Registration Document</p>
                  <a href={reviewVendor.reg_document_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View Document</a>
                </div>
              )}
              {(reviewVendor.gallery_urls || []).length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Gallery</p>
                  <div className="flex gap-2 flex-wrap">
                    {reviewVendor.gallery_urls.map((url, i) => <img key={i} src={url} alt="" className="w-24 h-16 object-cover rounded-lg border" />)}
                  </div>
                </div>
              )}
              {reviewVendor.approval_status === "Pending" && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="space-y-1.5">
                    <Label>Rejection Reason (required if rejecting)</Label>
                    <textarea className="w-full border border-input rounded-md p-2 text-sm h-20 bg-transparent resize-none" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="State reason for rejection..." />
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => ask("Approve Vendor?", `Approve ${reviewVendor.business_name} and notify them by email?`, () => approveVendor(reviewVendor))}>
                      <CheckCircle className="w-4 h-4 mr-2" />Approve
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 border-red-300"
                      onClick={() => ask("Reject Vendor?", `Reject ${reviewVendor.business_name} and notify them by email?`, () => rejectVendor(reviewVendor))}
                      disabled={!rejectReason}>
                      <XCircle className="w-4 h-4 mr-2" />Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Vendor Dialog */}
      <Dialog open={!!vendorDialog} onOpenChange={o => !o && setVendorDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{vendorDialog?.id ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Business Name *</Label><Input value={vendorForm.business_name} onChange={e => setVendorForm(f => ({ ...f, business_name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Owner Full Name *</Label><Input value={vendorForm.owner_full_name} onChange={e => setVendorForm(f => ({ ...f, owner_full_name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={vendorForm.email} onChange={e => setVendorForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Phone *</Label><Input value={vendorForm.phone} onChange={e => setVendorForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={vendorForm.category_id} onValueChange={v => {
                  const cat = categories.find(c => c.id === v);
                  setVendorForm(f => ({ ...f, category_id: v, category_name: cat?.name || "" }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={vendorForm.approval_status} onValueChange={v => setVendorForm(f => ({ ...f, approval_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Price Range</Label>
                <Select value={vendorForm.price_range} onValueChange={v => setVendorForm(f => ({ ...f, price_range: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budget">Budget</SelectItem>
                    <SelectItem value="Mid-range">Mid-range</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Opening Hours</Label><Input value={vendorForm.opening_hours} onChange={e => setVendorForm(f => ({ ...f, opening_hours: e.target.value }))} placeholder="e.g. Mon-Fri 8am-6pm" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={vendorForm.description} onChange={e => setVendorForm(f => ({ ...f, description: e.target.value }))} className="h-20" /></div>
            <div className="space-y-1.5"><Label>Services/Products</Label><Textarea value={vendorForm.services_products} onChange={e => setVendorForm(f => ({ ...f, services_products: e.target.value }))} className="h-16" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>City</Label><Input value={vendorForm.location_city} onChange={e => setVendorForm(f => ({ ...f, location_city: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>State</Label><Input value={vendorForm.location_state} onChange={e => setVendorForm(f => ({ ...f, location_state: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Website</Label><Input value={vendorForm.website} onChange={e => setVendorForm(f => ({ ...f, website: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Logo</Label>
                <div className="flex items-center gap-2">
                  {vendorForm.logo_url && <img src={vendorForm.logo_url} alt="" className="w-10 h-10 rounded object-cover border" />}
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingLogo}>
                      <span>{uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}Upload</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], setUploadingLogo, "logo_url")} />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Cover Image</Label>
                <div className="flex items-center gap-2">
                  {vendorForm.cover_image_url && <img src={vendorForm.cover_image_url} alt="" className="w-16 h-10 rounded object-cover border" />}
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingCover}>
                      <span>{uploadingCover ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}Upload</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], setUploadingCover, "cover_image_url")} />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setVendorDialog(null)}>Cancel</Button>
            <Button onClick={() => ask(
              vendorDialog?.id ? "Save Changes?" : "Create Vendor?",
              vendorDialog?.id ? `Update details for ${vendorForm.business_name}?` : `Add ${vendorForm.business_name} to the marketplace${vendorForm.email ? " and notify them by email" : ""}?`,
              saveVendor
            )}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={!!productDialog} onOpenChange={o => !o && setProductDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{productDialog?.product?.id ? "Edit Product/Service" : "Add Product/Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {!productDialog?.product?.id && (
              <div className="space-y-1.5">
                <Label>Vendor *</Label>
                <Select value={productDialog?.vendorId || ""} onValueChange={v => setProductDialog(d => ({ ...d, vendorId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.filter(v => v.approval_status === "Approved").map(v => <SelectItem key={v.id} value={v.id}>{v.business_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5"><Label>Name *</Label><Input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} className="h-20" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Price (₦) *</Label><Input type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Discount %</Label><Input type="number" min="0" max="100" value={productForm.discount_percent} onChange={e => setProductForm(f => ({ ...f, discount_percent: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Unit (e.g. per night)</Label><Input value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} /></div>
              <div className="space-y-1.5">
                <Label>Availability</Label>
                <Select value={productForm.is_available ? "true" : "false"} onValueChange={v => setProductForm(f => ({ ...f, is_available: v === "true" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="true">Available</SelectItem><SelectItem value="false">Unavailable</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(productForm.image_urls || []).map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-12 rounded object-cover border" />
                    <button type="button" onClick={() => setProductForm(f => ({ ...f, image_urls: f.image_urls.filter((_, j) => j !== i) }))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs hidden group-hover:flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
              <label className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild disabled={uploadingProductImg}>
                  <span>{uploadingProductImg ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}Add Image</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadProductImg(e.target.files[0])} />
              </label>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setProductDialog(null)}>Cancel</Button>
            <Button onClick={() => ask(
              productDialog?.product?.id ? "Save Changes?" : "Add Product?",
              productDialog?.product?.id ? `Update "${productForm.name}"?` : `Add "${productForm.name}" to the marketplace?`,
              saveProduct
            )}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={!!categoryDialog} onOpenChange={o => !o && setCategoryDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{categoryDialog?.id ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2"><Label>Name *</Label><Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hotels" /></div>
              <div className="space-y-1.5"><Label>Icon/Emoji</Label><Input value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏨" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={catForm.is_active ? "true" : "false"} onValueChange={v => setCatForm(f => ({ ...f, is_active: v === "true" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setCategoryDialog(null)}>Cancel</Button>
              <Button onClick={() => ask(
                categoryDialog?.id ? "Save Category?" : "Create Category?",
                categoryDialog?.id ? `Update "${catForm.name}"?` : `Create new category "${catForm.name}"?`,
                saveCategory
              )}>Save</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}