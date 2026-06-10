import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, MapPin, Flag, CheckCircle2, XCircle, Globe, Building2, Tag, Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import DirectoryListingForm from "@/components/directory/admin/DirectoryListingForm";
import DirectoryCategoryForm from "@/components/directory/admin/DirectoryCategoryForm";

export default function AdminDirectory() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAll = async () => {
    const [l, c, s] = await Promise.all([
      base44.entities.DirectoryListing.list("-created_date", 200),
      base44.entities.DirectoryCategory.list("sort_order", 50),
      base44.entities.DirectorySubmission.filter({ status: "pending" }, "-created_date", 100),
    ]);
    setListings(l);
    setCategories(c);
    setSubmissions(s);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDeleteListing = async () => {
    await base44.entities.DirectoryListing.delete(confirmDelete.id);
    setConfirmDelete(null);
    fetchAll();
  };

  const handleDeleteCategory = async (cat) => {
    await base44.entities.DirectoryCategory.delete(cat.id);
    fetchAll();
  };

  const handleToggleFeatured = async (l) => {
    await base44.entities.DirectoryListing.update(l.id, { is_featured: !l.is_featured });
    fetchAll();
  };

  const handleToggleStatus = async (l) => {
    const next = l.status === "active" ? "suspended" : "active";
    await base44.entities.DirectoryListing.update(l.id, { status: next });
    fetchAll();
  };

  const handleSubmissionAction = async (sub, action) => {
    await base44.entities.DirectorySubmission.update(sub.id, { status: action });
    if (action === "approved" && sub.type === "add_request" && sub.business_name) {
      await base44.entities.DirectoryListing.create({
        name: sub.business_name,
        category: sub.business_category,
        address: sub.business_address,
        phone: sub.business_phone,
        website: sub.business_website,
        description: sub.business_description,
        city: "Warri",
        state: "Delta State",
        status: "active",
        source: "manual",
      });
    }
    fetchAll();
  };

  const filteredListings = listings.filter(l =>
    !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const flagCount = submissions.filter(s => s.status === "pending" && s.type === "flag_report").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Directory Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage Warri City Directory listings, categories, and submissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }} variant="outline" size="sm" className="gap-1">
            <Tag className="w-4 h-4" /> Add Category
          </Button>
          <Button onClick={() => { setEditingListing(null); setShowListingForm(true); }} size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Listings", value: listings.length, icon: Building2, color: "text-primary" },
          { label: "Active", value: listings.filter(l => l.status === "active").length, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Pending Reviews", value: pendingCount, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Flag Reports", value: flagCount, icon: Flag, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-muted-foreground text-xs font-sans">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground font-heading">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-4">
          <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="submissions" className="relative">
            Submissions
            {pendingCount > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center">{pendingCount}</span>}
          </TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <div className="mb-4">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search listings by name or category..."
              className="max-w-sm"
            />
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Business</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs hidden lg:table-cell">Address</th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredListings.map(l => (
                  <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {l.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        <div>
                          <p className="font-medium text-foreground">{l.name}</p>
                          {l.phone && <p className="text-muted-foreground text-xs">{l.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{l.category || "—"}</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{l.address || "—"}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant={l.status === "active" ? "default" : "secondary"} className="text-xs">
                        {l.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleToggleFeatured(l)} title={l.is_featured ? "Unfeature" : "Feature"} className="h-7 w-7 p-0">
                          <Star className={`w-3.5 h-3.5 ${l.is_featured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(l)} title="Toggle status" className="h-7 w-7 p-0">
                          {l.status === "active" ? <XCircle className="w-3.5 h-3.5 text-muted-foreground" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingListing(l); setShowListingForm(true); }} className="h-7 w-7 p-0">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(l)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredListings.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">No listings found.</div>
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon || "📁"}</span>
                  <div>
                    <p className="font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }} className="h-7 w-7 p-0">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(cat)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}
              className="bg-card border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <div className="space-y-4">
            {submissions.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">No pending submissions.</div>
            )}
            {submissions.map(sub => (
              <div key={sub.id} className={`bg-card border rounded-xl p-5 ${sub.type === "flag_report" ? "border-red-200" : "border-border"}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={sub.type === "flag_report" ? "destructive" : sub.type === "claim_request" ? "default" : "secondary"} className="text-xs capitalize">
                        {sub.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(sub.created_date).toLocaleDateString()}</span>
                    </div>
                    <p className="font-medium text-foreground">
                      {sub.business_name || sub.listing_name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">{sub.submitter_name} · {sub.submitter_email}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleSubmissionAction(sub, "approved")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSubmissionAction(sub, "rejected")} className="text-xs h-8">
                      Reject
                    </Button>
                    {sub.type === "flag_report" && (
                      <Button size="sm" variant="outline" onClick={() => handleSubmissionAction(sub, "resolved")} className="text-xs h-8">
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {sub.business_category && <span>Category: {sub.business_category}</span>}
                  {sub.business_address && <span>Address: {sub.business_address}</span>}
                  {sub.business_phone && <span>Phone: {sub.business_phone}</span>}
                  {sub.business_website && <span>Website: {sub.business_website}</span>}
                  {sub.flag_reason && <span className="text-red-500 col-span-2">Reason: {sub.flag_reason}</span>}
                  {sub.claim_details && <span className="col-span-2">Claim: {sub.claim_details}</span>}
                  {sub.update_details && <span className="col-span-2">Updates requested: {sub.update_details}</span>}
                  {sub.business_description && <span className="col-span-2">Description: {sub.business_description}</span>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showListingForm && (
        <DirectoryListingForm
          listing={editingListing}
          categories={categories}
          onClose={() => { setShowListingForm(false); setEditingListing(null); }}
          onSaved={() => { setShowListingForm(false); setEditingListing(null); fetchAll(); }}
        />
      )}
      {showCategoryForm && (
        <DirectoryCategoryForm
          category={editingCategory}
          onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }}
          onSaved={() => { setShowCategoryForm(false); setEditingCategory(null); fetchAll(); }}
        />
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{confirmDelete?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteListing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}