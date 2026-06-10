import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Store, CheckCircle, XCircle, Clock, Star, Tag, Plus, Pencil, Trash2, Eye, TrendingUp, Users, Package, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";

export default function AdminMarketplace() {
  const queryClient = useQueryClient();
  const [approvalFilter, setApprovalFilter] = useState("Pending");
  const [reviewVendor, setReviewVendor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "", description: "", slug: "", sort_order: 0, is_active: true });

  const { data: vendors = [] } = useQuery({
    queryKey: ["all_vendors"],
    queryFn: () => base44.entities.Vendor.list("-created_date", 500),
  });

  const { data: categories = [], refetch: refetchCats } = useQuery({
    queryKey: ["all_categories"],
    queryFn: () => base44.entities.MarketplaceCategory.list("sort_order", 100),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["all_products"],
    queryFn: () => base44.entities.VendorProduct.list("-created_date", 500),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["all_reviews"],
    queryFn: () => base44.entities.VendorReview.list("-created_date", 200),
  });

  const approveVendor = async (id) => {
    await base44.entities.Vendor.update(id, { approval_status: "Approved" });
    const v = vendors.find(x => x.id === id);
    if (v?.email) {
      base44.functions.invoke("sendEmail", {
        to: v.email,
        subject: "Your Royal Marketplace Listing is Approved!",
        html: `<p>Congratulations <strong>${v.business_name}</strong>!</p><p>Your listing on the Royal Marketplace has been approved and is now live. You can view your listing and manage it via your vendor dashboard.</p><p>Royal Protocol Office<br/>Warri Kingdom</p>`,
        from_name: "Royal Marketplace",
      }).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
    toast.success("Vendor approved and notified");
    setReviewVendor(null);
  };

  const rejectVendor = async (id) => {
    await base44.entities.Vendor.update(id, { approval_status: "Rejected", rejection_reason: rejectReason });
    const v = vendors.find(x => x.id === id);
    if (v?.email) {
      base44.functions.invoke("sendEmail", {
        to: v.email,
        subject: "Royal Marketplace Registration Update",
        html: `<p>Dear ${v.owner_full_name},</p><p>We regret to inform you that your application for <strong>${v.business_name}</strong> has not been approved at this time.</p>${rejectReason ? `<p><strong>Reason:</strong> ${rejectReason}</p>` : ""}<p>You are welcome to re-apply after addressing the noted issues.</p><p>Royal Protocol Office<br/>Warri Kingdom</p>`,
        from_name: "Royal Marketplace",
      }).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
    toast.success("Vendor rejected and notified");
    setRejectReason("");
    setReviewVendor(null);
  };

  const toggleFeatured = async (v) => {
    await base44.entities.Vendor.update(v.id, { featured: !v.featured });
    queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
    toast.success(v.featured ? "Removed from featured" : "Marked as featured");
  };

  const toggleSuspend = async (v) => {
    const newStatus = v.approval_status === "Suspended" ? "Approved" : "Suspended";
    await base44.entities.Vendor.update(v.id, { approval_status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["all_vendors"] });
    toast.success(newStatus === "Suspended" ? "Vendor suspended" : "Vendor reinstated");
  };

  const approveReview = async (r) => {
    await base44.entities.VendorReview.update(r.id, { is_approved: true });
    queryClient.invalidateQueries({ queryKey: ["all_reviews"] });
    toast.success("Review approved");
  };

  const deleteReview = async (id) => {
    await base44.entities.VendorReview.delete(id);
    queryClient.invalidateQueries({ queryKey: ["all_reviews"] });
    toast.success("Review deleted");
  };

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

  const deleteCategory = async (id) => {
    await base44.entities.MarketplaceCategory.delete(id);
    refetchCats();
    toast.success("Category deleted");
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

  const statusColor = { Approved: "text-emerald-600 border-emerald-300 bg-emerald-50", Pending: "text-amber-600 border-amber-300 bg-amber-50", Rejected: "text-red-600 border-red-300 bg-red-50", Suspended: "text-gray-600 border-gray-300 bg-gray-50" };

  return (
    <div>
      <PageHeader title="Marketplace Management" subtitle="Manage vendors, categories, approvals and reviews">
        <Button size="sm" onClick={() => { setCatForm({ name: "", icon: "🏪", description: "", sort_order: 0, is_active: true }); setCategoryDialog("new"); }}>
          <Plus className="w-4 h-4 mr-1" />Add Category
        </Button>
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
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 text-2xl">
                      {v.category_name?.[0] || "🏪"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-sm truncate">{v.business_name}</p>
                      {v.featured && <Badge className="text-[9px] bg-accent text-accent-foreground">⭐ Featured</Badge>}
                      <Badge variant="outline" className={`text-[9px] ${statusColor[v.approval_status]}`}>{v.approval_status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{v.owner_full_name} · {v.email} · {v.category_name}</p>
                    <p className="text-xs text-muted-foreground">{v.location_city}{v.location_state ? `, ${v.location_state}` : ""} · {format(new Date(v.created_date), "dd MMM yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {v.approval_status === "Pending" && (
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => approveVendor(v.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setReviewVendor(v)}>
                    <Eye className="w-3 h-3 mr-1" />Review
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleFeatured(v)}>
                    <Star className="w-3 h-3 mr-1" />{v.featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button size="sm" variant="outline" className={`h-7 text-xs ${v.approval_status === "Suspended" ? "text-emerald-600" : "text-red-600"}`} onClick={() => toggleSuspend(v)}>
                    {v.approval_status === "Suspended" ? "Reinstate" : "Suspend"}
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
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setCatForm({ name: c.name, icon: c.icon, description: c.description, slug: c.slug, sort_order: c.sort_order || 0, is_active: c.is_active }); setCategoryDialog(c); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(c.id)}>
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
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => deleteReview(r.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
                    <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="State reason for rejection..." className="h-20" />
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => approveVendor(reviewVendor.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />Approve
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 border-red-300" onClick={() => rejectVendor(reviewVendor.id)} disabled={!rejectReason}>
                      <XCircle className="w-4 h-4 mr-2" />Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
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
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCategoryDialog(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveCategory}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}