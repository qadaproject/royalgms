import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Save, Users, Tag, Settings2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const EMPTY_PERSON = { full_name: "", category_id: "", category_name: "", bio: "", photo_url: "", email: "", phone: "", location: "", social_facebook: "", social_instagram: "", social_twitter: "", social_linkedin: "", is_active: true, sort_order: 0 };
const EMPTY_CAT = { name: "", icon: "", description: "", sort_order: 0, is_active: true };

export default function AdminItsekiri() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [personDialog, setPersonDialog] = useState(null);
  const [catDialog, setCatDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["itsekiri-categories-admin"],
    queryFn: () => base44.entities.ItsekiriCategory.list("sort_order", 100),
  });

  const { data: persons = [], isLoading: loadingPersons } = useQuery({
    queryKey: ["itsekiri-persons-admin"],
    queryFn: () => base44.entities.ItsekiriPerson.list("full_name", 500),
  });

  const { data: settingsArr = [], isLoading: loadingSettings } = useQuery({
    queryKey: ["itsekiri-settings-admin"],
    queryFn: () => base44.entities.ItsekiriDirectorySettings.list(),
  });
  const settings = settingsArr[0] || { show_photo: true, show_email: true, show_phone: true, show_social: true, show_location: true, mask_email: true, mask_phone: true };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["itsekiri-categories-admin"] });
    qc.invalidateQueries({ queryKey: ["itsekiri-persons-admin"] });
    qc.invalidateQueries({ queryKey: ["itsekiri-categories"] });
    qc.invalidateQueries({ queryKey: ["itsekiri-persons"] });
  };

  /* ── Category CRUD ── */
  const saveCategory = async () => {
    if (!catDialog.name?.trim()) return toast({ title: "Name required", variant: "destructive" });
    setSaving(true);
    try {
      if (catDialog.id) await base44.entities.ItsekiriCategory.update(catDialog.id, catDialog);
      else await base44.entities.ItsekiriCategory.create(catDialog);
      qc.invalidateQueries({ queryKey: ["itsekiri-categories-admin"] });
      qc.invalidateQueries({ queryKey: ["itsekiri-categories"] });
      setCatDialog(null);
      toast({ title: "Category saved" });
    } finally { setSaving(false); }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    await base44.entities.ItsekiriCategory.delete(id);
    qc.invalidateQueries({ queryKey: ["itsekiri-categories-admin"] });
    qc.invalidateQueries({ queryKey: ["itsekiri-categories"] });
  };

  /* ── Person CRUD ── */
  const savePerson = async () => {
    if (!personDialog.full_name?.trim() || !personDialog.category_id) return toast({ title: "Name and category required", variant: "destructive" });
    setSaving(true);
    try {
      const cat = categories.find(c => c.id === personDialog.category_id);
      const data = { ...personDialog, category_name: cat?.name || personDialog.category_name };
      if (data.id) await base44.entities.ItsekiriPerson.update(data.id, data);
      else await base44.entities.ItsekiriPerson.create(data);
      invalidate();
      setPersonDialog(null);
      toast({ title: "Person saved" });
    } finally { setSaving(false); }
  };

  const deletePerson = async (id) => {
    if (!confirm("Delete this person?")) return;
    await base44.entities.ItsekiriPerson.delete(id);
    invalidate();
  };

  /* ── Settings ── */
  const updateSettings = async (field, value) => {
    const updated = { ...settings, [field]: value };
    if (settings.id) await base44.entities.ItsekiriDirectorySettings.update(settings.id, updated);
    else await base44.entities.ItsekiriDirectorySettings.create(updated);
    qc.invalidateQueries({ queryKey: ["itsekiri-settings-admin"] });
    qc.invalidateQueries({ queryKey: ["itsekiri-settings"] });
  };

  const filteredPersons = persons.filter(p => {
    const matchCat = catFilter === "all" || p.category_id === catFilter;
    const q = searchQ.toLowerCase();
    const matchQ = !q || p.full_name?.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Itsekiri Directory</h1>
          <p className="text-sm text-muted-foreground">{persons.length} people · {categories.length} categories</p>
        </div>
      </div>

      <Tabs defaultValue="people">
        <TabsList className="mb-6">
          <TabsTrigger value="people"><Users className="w-3.5 h-3.5 mr-1.5" />People ({persons.length})</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="w-3.5 h-3.5 mr-1.5" />Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="settings"><Settings2 className="w-3.5 h-3.5 mr-1.5" />Display Settings</TabsTrigger>
        </TabsList>

        {/* ── PEOPLE ── */}
        <TabsContent value="people">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search people..." className="pl-8 h-8 text-sm" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="h-8 text-sm border border-border rounded-md px-2 bg-background text-foreground">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button size="sm" className="ml-auto gap-1" onClick={() => setPersonDialog({ ...EMPTY_PERSON })}>
              <Plus className="w-3.5 h-3.5" />Add Person
            </Button>
          </div>

          {loadingPersons ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : filteredPersons.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No people found.</p>
          ) : (
            <div className="space-y-2">
              {filteredPersons.map(p => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-base">👤</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{p.full_name}</span>
                      <Badge variant="outline" className="text-[10px]">{p.category_name}</Badge>
                      {!p.is_active && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                    </div>
                    {p.bio && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{p.bio}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setPersonDialog({ ...p })}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deletePerson(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── CATEGORIES ── */}
        <TabsContent value="categories">
          <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1" onClick={() => setCatDialog({ ...EMPTY_CAT })}>
              <Plus className="w-3.5 h-3.5" />Add Category
            </Button>
          </div>
          {loadingCats ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">{cat.icon || "📁"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{cat.name}</span>
                      {!cat.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                      <span className="text-xs text-muted-foreground">({persons.filter(p => p.category_id === cat.id).length} people)</span>
                    </div>
                    {cat.description && <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setCatDialog({ ...cat })}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteCategory(cat.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── DISPLAY SETTINGS ── */}
        <TabsContent value="settings">
          {loadingSettings ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="max-w-lg space-y-4 bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-sm mb-4">Control what information is visible on all public profiles</h3>
              {[
                { field: "show_photo", label: "Show Profile Photos" },
                { field: "show_location", label: "Show Location" },
                { field: "show_email", label: "Show Email Address" },
                { field: "mask_email", label: "Mask Email (show partially)" },
                { field: "show_phone", label: "Show Phone Number" },
                { field: "mask_phone", label: "Mask Phone (show partially)" },
                { field: "show_social", label: "Show Social Media Links" },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <Label className="text-sm cursor-pointer">{label}</Label>
                  <Switch
                    checked={!!settings[field]}
                    onCheckedChange={val => updateSettings(field, val)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Person Dialog */}
      <Dialog open={!!personDialog} onOpenChange={o => !o && setPersonDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{personDialog?.id ? "Edit Person" : "Add Person"}</DialogTitle>
          </DialogHeader>
          {personDialog && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Full Name *</Label>
                <Input value={personDialog.full_name} onChange={e => setPersonDialog(p => ({ ...p, full_name: e.target.value }))} placeholder="e.g. Dr. Amina Efurun" />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <select value={personDialog.category_id} onChange={e => setPersonDialog(p => ({ ...p, category_id: e.target.value }))} className="w-full h-9 border border-border rounded-md px-3 text-sm bg-background text-foreground">
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={personDialog.location} onChange={e => setPersonDialog(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Lagos, Nigeria" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Bio / Qualifications</Label>
                <Textarea value={personDialog.bio} onChange={e => setPersonDialog(p => ({ ...p, bio: e.target.value }))} className="h-24" placeholder="Brief bio and qualifications..." />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={personDialog.email} onChange={e => setPersonDialog(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={personDialog.phone} onChange={e => setPersonDialog(p => ({ ...p, phone: e.target.value }))} placeholder="+234 800 000 0000" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Profile Photo URL</Label>
                <Input value={personDialog.photo_url} onChange={e => setPersonDialog(p => ({ ...p, photo_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label>Facebook URL</Label>
                <Input value={personDialog.social_facebook} onChange={e => setPersonDialog(p => ({ ...p, social_facebook: e.target.value }))} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label>Instagram URL</Label>
                <Input value={personDialog.social_instagram} onChange={e => setPersonDialog(p => ({ ...p, social_instagram: e.target.value }))} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label>Twitter / X URL</Label>
                <Input value={personDialog.social_twitter} onChange={e => setPersonDialog(p => ({ ...p, social_twitter: e.target.value }))} placeholder="https://x.com/..." />
              </div>
              <div className="space-y-1.5">
                <Label>LinkedIn URL</Label>
                <Input value={personDialog.social_linkedin} onChange={e => setPersonDialog(p => ({ ...p, social_linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={personDialog.sort_order} onChange={e => setPersonDialog(p => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={!!personDialog.is_active} onCheckedChange={v => setPersonDialog(p => ({ ...p, is_active: v }))} />
                <Label>Visible to public</Label>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setPersonDialog(null)}>Cancel</Button>
            <Button onClick={savePerson} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={!!catDialog} onOpenChange={o => !o && setCatDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{catDialog?.id ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          {catDialog && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Category Name *</Label>
                <Input value={catDialog.name} onChange={e => setCatDialog(c => ({ ...c, name: e.target.value }))} placeholder="e.g. Lawyers" />
              </div>
              <div className="space-y-1.5">
                <Label>Icon (emoji)</Label>
                <Input value={catDialog.icon} onChange={e => setCatDialog(c => ({ ...c, icon: e.target.value }))} placeholder="e.g. ⚖️" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={catDialog.description} onChange={e => setCatDialog(c => ({ ...c, description: e.target.value }))} className="h-20" />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={catDialog.sort_order} onChange={e => setCatDialog(c => ({ ...c, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!catDialog.is_active} onCheckedChange={v => setCatDialog(c => ({ ...c, is_active: v }))} />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setCatDialog(null)}>Cancel</Button>
            <Button onClick={saveCategory} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}