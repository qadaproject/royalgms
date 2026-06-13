import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Package, Star, Settings, Plus, Pencil, Trash2, ArrowLeft, Loader2, Upload, CheckCircle, XCircle, Clock, BadgeCheck, AtSign, Link2, Eye, Heart, Share2, MessageSquare, Flag, Trophy, BarChart2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import StarRating from "../components/marketplace/StarRating";
import ProductEngagementCard from "../components/marketplace/ProductEngagementCard";
import ProductPerformanceChart from "../components/marketplace/ProductPerformanceChart";
import VendorNotificationBell from "../components/marketplace/VendorNotificationBell";
import VendorAnalyticsTab from "../components/marketplace/VendorAnalyticsTab";

// Top Rated threshold: 10+ favourites across all products OR avg rating >= 4.5 with 3+ reviews
const isTopRated = (vendor, products) => {
  const totalFavs = products.reduce((a, p) => a + (p.favourite_count || 0), 0);
  return totalFavs >= 10 || (vendor.average_rating >= 4.5 && vendor.review_count >= 3);
};

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(null); // null | 'new' | product object
  const [editSettings, setEditSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({});
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", discount_percent: 0, unit: "", is_available: true });
  const [uploadingImg, setUploadingImg] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const session = sessionStorage.getItem("vendor_session");
    if (!session) { window.location.href = "/marketplace/vendor/login"; return; }
    const { id } = JSON.parse(session);
    base44.entities.Vendor.filter({ id }).then(results => {
      if (results.length > 0) setVendor(results[0]);
      else { sessionStorage.removeItem("vendor_session"); window.location.href = "/marketplace/vendor/login"; }
    }).catch(() => { window.location.href = "/marketplace/vendor/login"; })
      .finally(() => setLoading(false));
  }, []);

  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ["my_products", vendor?.id],
    queryFn: () => base44.entities.VendorProduct.filter({ vendor_id: vendor?.id }),
    enabled: !!vendor?.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["my_reviews", vendor?.id],
    queryFn: () => base44.entities.VendorReview.filter({ vendor_id: vendor?.id }),
    enabled: !!vendor?.id,
  });

  const handleLogout = () => {
    sessionStorage.removeItem("vendor_session");
    window.location.href = "/marketplace/vendor/login";
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) { toast.error("Name and price are required"); return; }
    const data = { ...productForm, price: parseFloat(productForm.price), vendor_id: vendor.id, vendor_name: vendor.business_name };
    if (productForm.discount_percent > 0) {
      data.discounted_price = data.price * (1 - productForm.discount_percent / 100);
    }
    if (productDialog?.id) {
      await base44.entities.VendorProduct.update(productDialog.id, data);
      toast.success("Product updated");
    } else {
      await base44.entities.VendorProduct.create(data);
      toast.success("Product added");
    }
    setProductDialog(null);
    setProductForm({ name: "", description: "", price: "", discount_percent: 0, unit: "", is_available: true });
    refetchProducts();
  };

  const deleteProduct = async (id) => {
    await base44.entities.VendorProduct.delete(id);
    toast.success("Product removed");
    refetchProducts();
  };

  const saveSettings = async () => {
    await base44.entities.Vendor.update(vendor.id, settingsForm);
    setVendor(v => ({ ...v, ...settingsForm }));
    setEditSettings(false);
    toast.success("Settings saved");
  };

  const canSetUsername = () => {
    if (!vendor.marketplace_username_set_date) return true;
    const setDate = new Date(vendor.marketplace_username_set_date);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return setDate < threeMonthsAgo;
  };

  const nextUsernameDate = () => {
    if (!vendor.marketplace_username_set_date) return null;
    const d = new Date(vendor.marketplace_username_set_date);
    d.setMonth(d.getMonth() + 3);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const saveUsername = async () => {
    const slug = usernameInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!slug) { toast.error("Please enter a valid username (letters, numbers, hyphens, underscores)"); return; }
    if (!canSetUsername()) { toast.error("You can only change your username once every 3 months"); return; }
    // Check uniqueness
    const existing = await base44.entities.Vendor.filter({ marketplace_username: slug });
    if (existing.some(v => v.id !== vendor.id)) { toast.error("That username is already taken"); return; }
    setSavingUsername(true);
    const today = new Date().toISOString().split("T")[0];
    await base44.entities.Vendor.update(vendor.id, { marketplace_username: slug, marketplace_username_set_date: today });
    setVendor(v => ({ ...v, marketplace_username: slug, marketplace_username_set_date: today }));
    setUsernameInput("");
    setSavingUsername(false);
    toast.success("Marketplace username saved!");
  };

  const uploadProductImage = async (file) => {
    setUploadingImg(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProductForm(f => ({ ...f, image_urls: [...(f.image_urls || []), file_url] }));
    setUploadingImg(false);
  };

  const statusBadge = (s) => {
    const map = { Approved: "bg-emerald-100 text-emerald-700 border-emerald-300", Pending: "bg-amber-100 text-amber-700 border-amber-300", Rejected: "bg-red-100 text-red-700 border-red-300", Suspended: "bg-gray-100 text-gray-600 border-gray-300" };
    const icons = { Approved: <CheckCircle className="w-3 h-3" />, Pending: <Clock className="w-3 h-3" />, Rejected: <XCircle className="w-3 h-3" />, Suspended: <XCircle className="w-3 h-3" /> };
    return <Badge variant="outline" className={`gap-1 text-xs ${map[s] || ""}`}>{icons[s]}{s}</Badge>;
  };

  if (loading || !vendor) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          {vendor.logo_url && <img src={vendor.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border shadow" />}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {statusBadge(vendor.approval_status)}
              <Badge variant="outline" className="text-[10px]">{vendor.category_name}</Badge>
            </div>
            <h1 className="font-heading text-2xl font-semibold flex items-center gap-2 flex-wrap">
              {vendor.business_name}
              {vendor.approval_status === "Approved" && vendor.verified_badge_enabled !== false && <BadgeCheck className="w-6 h-6 text-blue-500 shrink-0" title="Verified & Approved" />}
              {isTopRated(vendor, products) && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-2 py-0.5">
                  <Trophy className="w-3 h-3" /> Top Rated
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">{vendor.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <VendorNotificationBell vendorId={vendor.id} />
            {vendor.approval_status === "Approved" && (
              <Button asChild variant="outline" size="sm">
                <Link to={vendor.marketplace_username ? `/marketplace/vendor/${vendor.marketplace_username}` : `/marketplace/vendor?id=${vendor.id}`}>View Public Listing</Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Email verification banner */}
        {!vendor.email_verified && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 text-sm text-orange-800 flex items-start gap-3">
            <span className="text-xl mt-0.5">📧</span>
            <div>
              <p className="font-semibold mb-0.5">Email Verification Required</p>
              <p>Please check your inbox at <strong>{vendor.email}</strong> and click the verification link to activate your account. Your application will not be reviewed until your email is verified.</p>
            </div>
          </div>
        )}
        {vendor.approval_status === "Pending" && vendor.email_verified && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-700">
            <strong>Under Review:</strong> Your listing is being reviewed by our team. You'll be notified at <strong>{vendor.email}</strong> once a decision is made (typically 2–3 business days).
          </div>
        )}
        {vendor.approval_status === "Pending" && !vendor.email_verified && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-700">
            <strong>Awaiting Email Verification:</strong> Verify your email first to move your application to review.
          </div>
        )}
        {vendor.approval_status === "Rejected" && vendor.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            <strong>Application Rejected:</strong> {vendor.rejection_reason}
            <p className="mt-1 text-xs">Contact us at <a href="mailto:marketplace@royalgms.com" className="underline">marketplace@royalgms.com</a> for assistance.</p>
          </div>
        )}
        {vendor.approval_status === "Suspended" && (
          <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 mb-4 text-sm text-gray-700">
            <strong>Account Suspended:</strong> Your listing has been suspended. Please contact <a href="mailto:marketplace@royalgms.com" className="underline">marketplace@royalgms.com</a> for assistance.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Products", value: products.length, icon: <Package className="w-5 h-5 text-primary" /> },
            { label: "Reviews", value: reviews.length, icon: <Star className="w-5 h-5 text-amber-400" /> },
            { label: "Avg. Rating", value: (vendor.average_rating || 0).toFixed(1), icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> },
            { label: "Status", value: vendor.approval_status, icon: <Store className="w-5 h-5 text-primary" /> },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
              <p className="font-heading text-xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
        {/* Engagement totals */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Profile Visits", value: vendor.profile_view_count || 0, icon: <Users className="w-4 h-4 text-indigo-500" /> },
            { label: "Total Views", value: products.reduce((a, p) => a + (p.view_count || 0), 0), icon: <Eye className="w-4 h-4 text-muted-foreground" /> },
            { label: "Favourites", value: products.reduce((a, p) => a + (p.favourite_count || 0), 0), icon: <Heart className="w-4 h-4 text-red-400" /> },
            { label: "Shares", value: products.reduce((a, p) => a + (p.share_count || 0), 0), icon: <Share2 className="w-4 h-4 text-green-500" /> },
            { label: "Comments", value: products.reduce((a, p) => a + (p.comment_count || 0), 0), icon: <MessageSquare className="w-4 h-4 text-blue-500" /> },
            { label: "Reports", value: products.reduce((a, p) => a + (p.report_count || 0), 0), icon: <Flag className="w-4 h-4 text-amber-500" /> },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              {s.icon}
              <div>
                <p className="font-heading text-lg font-semibold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {products.length > 0 && <ProductPerformanceChart products={products} />}

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products"><Package className="w-4 h-4 mr-1" />Products/Services</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart2 className="w-4 h-4 mr-1" />Analytics</TabsTrigger>
            <TabsTrigger value="reviews"><Star className="w-4 h-4 mr-1" />Reviews</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" />Settings</TabsTrigger>
          </TabsList>

          {/* Products */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold">Your Listings</h2>
              <Button size="sm" onClick={() => { setProductForm({ name: "", description: "", price: "", discount_percent: 0, unit: "", is_available: true, image_urls: [] }); setProductDialog("new"); }}>
                <Plus className="w-4 h-4 mr-1" />Add Listing
              </Button>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No listings yet. Add your products or services.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map(p => (
                  <ProductEngagementCard
                    key={p.id}
                    product={p}
                    vendor={vendor}
                    onEdit={() => { setProductForm({ ...p }); setProductDialog(p); }}
                    onDelete={() => deleteProduct(p.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <VendorAnalyticsTab vendor={vendor} products={products} />
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <h2 className="font-heading text-lg font-semibold mb-4">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{r.reviewer_name}</p>
                        {!r.is_approved && <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-400">Pending</Badge>}
                      </div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    {r.title && <p className="text-sm font-medium">{r.title}</p>}
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            {/* Marketplace Username */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <AtSign className="w-4 h-4 text-primary" />
                <h3 className="font-heading text-base font-semibold">Marketplace Username</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Set a custom URL for your public listing. <strong>Can only be changed once every 3 months.</strong></p>
              {vendor.marketplace_username && (
                <div className="flex items-center gap-2 mb-3 p-2.5 bg-muted rounded-lg text-sm">
                  <Link2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">royalgms.com/marketplace/vendor/</span>
                  <span className="font-semibold text-foreground">{vendor.marketplace_username}</span>
                </div>
              )}
              {canSetUsername() ? (
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center border border-input rounded-md overflow-hidden">
                    <span className="px-2 text-xs text-muted-foreground bg-muted border-r border-input py-2 shrink-0">/vendor/</span>
                    <input
                      className="flex-1 px-2 py-1.5 text-sm bg-transparent outline-none"
                      placeholder={vendor.marketplace_username || "your-business-name"}
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                    />
                  </div>
                  <Button size="sm" onClick={saveUsername} disabled={savingUsername || !usernameInput.trim()}>
                    {savingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⏳ You can next change your username on <strong>{nextUsernameDate()}</strong>.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold">Business Settings</h2>
              {!editSettings ? (
                <Button size="sm" variant="outline" onClick={() => { setSettingsForm({ description: vendor.description, services_products: vendor.services_products, opening_hours: vendor.opening_hours, website: vendor.website, phone: vendor.phone, location_address: vendor.location_address, location_city: vendor.location_city, location_state: vendor.location_state, social_facebook: vendor.social_facebook, social_instagram: vendor.social_instagram, social_twitter: vendor.social_twitter, social_whatsapp: vendor.social_whatsapp }); setEditSettings(true); }}>
                  <Pencil className="w-4 h-4 mr-1" />Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditSettings(false)}>Cancel</Button>
                  <Button size="sm" onClick={saveSettings}>Save Changes</Button>
                </div>
              )}
            </div>
            {!editSettings ? (
              <div className="space-y-3 text-sm">
                {[["Description", vendor.description], ["Services/Products", vendor.services_products], ["Opening Hours", vendor.opening_hours], ["Website", vendor.website], ["Phone", vendor.phone], ["Address", vendor.location_address], ["City", vendor.location_city]].map(([label, val]) => val ? (
                  <div key={label} className="flex gap-3"><span className="text-muted-foreground w-36 shrink-0">{label}:</span><span>{val}</span></div>
                ) : null)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5"><Label>Description</Label><Textarea value={settingsForm.description || ""} onChange={e => setSettingsForm(f => ({ ...f, description: e.target.value }))} className="h-24" /></div>
                <div className="space-y-1.5"><Label>Services/Products</Label><Textarea value={settingsForm.services_products || ""} onChange={e => setSettingsForm(f => ({ ...f, services_products: e.target.value }))} className="h-20" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Phone</Label><Input value={settingsForm.phone || ""} onChange={e => setSettingsForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Opening Hours</Label><Input value={settingsForm.opening_hours || ""} onChange={e => setSettingsForm(f => ({ ...f, opening_hours: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Website</Label><Input value={settingsForm.website || ""} onChange={e => setSettingsForm(f => ({ ...f, website: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>City</Label><Input value={settingsForm.location_city || ""} onChange={e => setSettingsForm(f => ({ ...f, location_city: e.target.value }))} /></div>
                </div>
                <div className="space-y-1.5"><Label>Full Address</Label><Input value={settingsForm.location_address || ""} onChange={e => setSettingsForm(f => ({ ...f, location_address: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Facebook</Label><Input value={settingsForm.social_facebook || ""} onChange={e => setSettingsForm(f => ({ ...f, social_facebook: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Instagram</Label><Input value={settingsForm.social_instagram || ""} onChange={e => setSettingsForm(f => ({ ...f, social_instagram: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={settingsForm.social_whatsapp || ""} onChange={e => setSettingsForm(f => ({ ...f, social_whatsapp: e.target.value }))} /></div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={!!productDialog} onOpenChange={o => !o && setProductDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{productDialog?.id ? "Edit Listing" : "Add New Listing"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} className="h-20" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Price (₦) *</Label><Input type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Discount %</Label><Input type="number" min="0" max="100" value={productForm.discount_percent} onChange={e => setProductForm(f => ({ ...f, discount_percent: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Unit (e.g. per night, per head)</Label><Input value={productForm.unit} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(productForm.image_urls || []).map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-12 rounded object-cover border" />
                    <button type="button" onClick={() => setProductForm(f => ({ ...f, image_urls: f.image_urls.filter((_, j) => j !== i) }))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs items-center justify-center hidden group-hover:flex">×</button>
                  </div>
                ))}
              </div>
              <label className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild disabled={uploadingImg}>
                  <span>{uploadingImg ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}Add Image</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadProductImage(e.target.files[0])} />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setProductDialog(null)}>Cancel</Button>
            <Button className="flex-1" onClick={saveProduct}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}