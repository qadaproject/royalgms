import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const emptyPerson = {
  full_name: "", category_id: "", category_name: "", profession: "", bio: "",
  photo_url: "", email: "", phone: "",
  social_facebook: "", social_instagram: "", social_twitter: "", social_linkedin: "", social_whatsapp: "",
  show_email: false, show_phone: false, show_social: true, show_bio: true, is_active: true,
};

const emptyCategory = { name: "", icon: "", description: "", is_active: true, sort_order: 0 };

export default function AdminItsekiris() {
  const [tab, setTab] = useState("persons");
  const [persons, setPersons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [personDialog, setPersonDialog] = useState(false);
  const [catDialog, setCatDialog] = useState(false);
  const [editPerson, setEditPerson] = useState(null);
  const [editCat, setEditCat] = useState(null);
  const [personForm, setPersonForm] = useState(emptyPerson);
  const [catForm, setCatForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);
  const [viewPerson, setViewPerson] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [globalVisibility, setGlobalVisibility] = useState({ show_bio: true, show_email: false, show_phone: false, show_social: true });
  const [applyingGlobal, setApplyingGlobal] = useState(false);

  const applyGlobalVisibility = async (field, value) => {
    const updated = { ...globalVisibility, [field]: value };
    setGlobalVisibility(updated);
    setApplyingGlobal(true);
    const all = await base44.entities.ItsekiriPerson.list("-created_date", 500);
    await Promise.all(all.map((p) => base44.entities.ItsekiriPerson.update(p.id, { [field]: value })));
    setApplyingGlobal(false);
    loadData();
  };

  const loadData = () => {
    base44.entities.ItsekiriPerson.list("-created_date", 200).then(setPersons);
    base44.entities.ItsekiriCategory.list("sort_order", 100).then(setCategories);
  };

  useEffect(() => { loadData(); }, []);

  // --- Person CRUD ---
  const openAddPerson = () => { setEditPerson(null); setPersonForm({ ...emptyPerson, ...globalVisibility }); setPersonDialog(true); };
  const openEditPerson = (p) => { setEditPerson(p); setPersonForm({ ...emptyPerson, ...p }); setPersonDialog(true); };

  const savePerson = async () => {
    setSaving(true);
    const cat = categories.find((c) => c.id === personForm.category_id);
    const data = { ...personForm, category_name: cat?.name || "" };
    if (editPerson) {
      await base44.entities.ItsekiriPerson.update(editPerson.id, data);
    } else {
      await base44.entities.ItsekiriPerson.create(data);
    }
    setSaving(false);
    setPersonDialog(false);
    await base44.entities.ItsekiriPerson.list("-created_date", 200).then((data) => {
      setPersons(data);
      base44.entities.ItsekiriCategory.list("sort_order", 100).then(setCategories);
    });
  };

  const deletePerson = async (id) => {
    if (!confirm("Delete this person?")) return;
    await base44.entities.ItsekiriPerson.delete(id);
    loadData();
  };

  const togglePersonActive = async (p) => {
    await base44.entities.ItsekiriPerson.update(p.id, { is_active: !p.is_active });
    loadData();
  };

  // --- Category CRUD ---
  const openAddCat = () => { setEditCat(null); setCatForm(emptyCategory); setCatDialog(true); };
  const openEditCat = (c) => { setEditCat(c); setCatForm({ ...emptyCategory, ...c }); setCatDialog(true); };

  const saveCat = async () => {
    setSaving(true);
    if (editCat) {
      await base44.entities.ItsekiriCategory.update(editCat.id, catForm);
    } else {
      await base44.entities.ItsekiriCategory.create(catForm);
    }
    setSaving(false);
    setCatDialog(false);
    loadData();
  };

  const deleteCat = async (id) => {
    if (!confirm("Delete this category?")) return;
    await base44.entities.ItsekiriCategory.delete(id);
    loadData();
  };

  const filteredPersons = persons.filter((p) =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.profession?.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected if needed
    e.target.value = "";
    setUploadingPhoto(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      const file_url = result?.file_url || result?.url || result;
      if (file_url && typeof file_url === "string") {
        upd("photo_url", file_url);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const upd = (f, v) => setPersonForm((prev) => ({ ...prev, [f]: v }));
  const updCat = (f, v) => setCatForm((prev) => ({ ...prev, [f]: v }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Itsekiris Directory</h1>
          <p className="text-muted-foreground text-sm">Manage people profiles and categories</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="persons">People ({persons.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
        </TabsList>

        {/* PERSONS TAB */}
        <TabsContent value="persons">
          {/* Global Visibility Panel */}
          <div className="border rounded-lg p-4 mb-5 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-sm">Global Profile Visibility</p>
                <p className="text-muted-foreground text-xs">These toggles apply to <strong>all profiles at once</strong>.</p>
              </div>
              {applyingGlobal && <span className="text-xs text-muted-foreground animate-pulse">Applying to all…</span>}
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { key: "show_bio", label: "Show Bio" },
                { key: "show_email", label: "Show Email (masked)" },
                { key: "show_phone", label: "Show Phone (masked)" },
                { key: "show_social", label: "Show Social Links" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Switch
                    checked={globalVisibility[key]}
                    onCheckedChange={(v) => applyGlobalVisibility(key, v)}
                    disabled={applyingGlobal}
                  />
                  <Label className="text-sm cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people..." className="pl-9" />
            </div>
            <Button onClick={openAddPerson}><Plus className="w-4 h-4 mr-2" />Add Person</Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Profession</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersons.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.photo_url ? (
                          <img src={p.photo_url} className="w-8 h-8 rounded-full object-cover" alt=""
                            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                          />
                        ) : null}
                        <div className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center text-primary text-xs font-semibold" style={{ display: p.photo_url ? "none" : "flex" }}>{p.full_name?.charAt(0)}</div>
                        <span className="font-medium">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.profession || "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{p.category_name || "—"}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePersonActive(p)} className="flex items-center gap-1 text-xs">
                        {p.is_active
                          ? <><ToggleRight className="w-5 h-5 text-green-600" /> <span className="text-green-600">Active</span></>
                          : <><ToggleLeft className="w-5 h-5 text-muted-foreground" /> <span className="text-muted-foreground">Off</span></>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewPerson(p)} title="View"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditPerson(p)} title="Edit"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deletePerson(p.id)} className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPersons.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No people found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* CATEGORIES TAB */}
        <TabsContent value="categories">
          <div className="flex justify-end mb-4">
            <Button onClick={openAddCat}><Plus className="w-4 h-4 mr-2" />Add Category</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="border rounded-lg p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium flex items-center gap-2">{cat.icon} {cat.name}</p>
                  {cat.description && <p className="text-muted-foreground text-xs mt-1">{cat.description}</p>}
                  <Badge variant={cat.is_active ? "default" : "secondary"} className="mt-2 text-[10px]">{cat.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditCat(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCat(cat.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-muted-foreground text-sm col-span-3 py-8 text-center">No categories yet.</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Person Dialog */}
      <Dialog open={personDialog} onOpenChange={setPersonDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPerson ? "Edit Person" : "Add Person"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Full Name *</Label>
                <Input value={personForm.full_name} onChange={(e) => upd("full_name", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Profession</Label>
                <Input value={personForm.profession} onChange={(e) => upd("profession", e.target.value)} placeholder="e.g. Medical Doctor" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Category</Label>
                <select value={personForm.category_id} onChange={(e) => upd("category_id", e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background">
                  <option value="">— None —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Profile Photo</Label>
                <div className="flex items-center gap-3 mt-1">
                  {personForm.photo_url && (
                    <img src={personForm.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border border-border shrink-0" />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-input rounded-md px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex-1">
                    <Upload className="w-4 h-4 shrink-0" />
                    <span>{uploadingPhoto ? "Uploading..." : personForm.photo_url ? "Change Photo" : "Upload Photo"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">Bio / Profile</Label>
              <Textarea value={personForm.bio} onChange={(e) => upd("bio", e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={personForm.email} onChange={(e) => upd("email", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={personForm.phone} onChange={(e) => upd("phone", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Facebook URL</Label><Input value={personForm.social_facebook} onChange={(e) => upd("social_facebook", e.target.value)} /></div>
              <div><Label className="text-xs">Instagram URL</Label><Input value={personForm.social_instagram} onChange={(e) => upd("social_instagram", e.target.value)} /></div>
              <div><Label className="text-xs">Twitter / X URL</Label><Input value={personForm.social_twitter} onChange={(e) => upd("social_twitter", e.target.value)} /></div>
              <div><Label className="text-xs">LinkedIn URL</Label><Input value={personForm.social_linkedin} onChange={(e) => upd("social_linkedin", e.target.value)} /></div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Profile Active</Label>
                <Switch checked={!!personForm.is_active} onCheckedChange={(v) => upd("is_active", v)} />
              </div>
              {!editPerson && (
                <p className="text-xs text-muted-foreground mt-2">Visibility settings (Bio, Email, Phone, Social) are controlled globally from the People tab.</p>
              )}
              {editPerson && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    { key: "show_bio", label: "Show Bio" },
                    { key: "show_email", label: "Show Email (masked)" },
                    { key: "show_phone", label: "Show Phone (masked)" },
                    { key: "show_social", label: "Show Social Links" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm">{label}</Label>
                      <Switch checked={!!personForm[key]} onCheckedChange={(v) => upd(key, v)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setPersonDialog(false)}>Cancel</Button>
            <Button onClick={savePerson} disabled={saving || !personForm.full_name}>{saving ? "Saving..." : editPerson ? "Update" : "Add Person"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Person Dialog */}
      <Dialog open={!!viewPerson} onOpenChange={() => setViewPerson(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Person Profile</DialogTitle>
          </DialogHeader>
          {viewPerson && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                {viewPerson.photo_url ? (
                  <img src={viewPerson.photo_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  />
                ) : null}
                <div className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center text-primary text-2xl font-semibold" style={{ display: viewPerson.photo_url ? "none" : "flex" }}>{viewPerson.full_name?.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-lg">{viewPerson.full_name}</p>
                  {viewPerson.profession && <p className="text-sm text-muted-foreground">{viewPerson.profession}</p>}
                  {viewPerson.category_name && <Badge variant="outline" className="mt-1 text-xs">{viewPerson.category_name}</Badge>}
                </div>
              </div>
              {viewPerson.bio && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm">{viewPerson.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {viewPerson.email && <div><p className="text-xs text-muted-foreground">Email</p><p>{viewPerson.email}</p></div>}
                {viewPerson.phone && <div><p className="text-xs text-muted-foreground">Phone</p><p>{viewPerson.phone}</p></div>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {viewPerson.social_facebook && <a href={viewPerson.social_facebook} target="_blank" rel="noreferrer" className="text-primary underline">Facebook</a>}
                {viewPerson.social_instagram && <a href={viewPerson.social_instagram} target="_blank" rel="noreferrer" className="text-primary underline">Instagram</a>}
                {viewPerson.social_twitter && <a href={viewPerson.social_twitter} target="_blank" rel="noreferrer" className="text-primary underline">Twitter/X</a>}
                {viewPerson.social_linkedin && <a href={viewPerson.social_linkedin} target="_blank" rel="noreferrer" className="text-primary underline">LinkedIn</a>}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground border-t pt-3">
                <span>Status: <strong className={viewPerson.is_active ? "text-green-600" : "text-red-500"}>{viewPerson.is_active ? "Active" : "Inactive"}</strong></span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setViewPerson(null)}>Close</Button>
            <Button onClick={() => { openEditPerson(viewPerson); setViewPerson(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCat ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Category Name *</Label>
                <Input value={catForm.name} onChange={(e) => updCat("name", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Emoji Icon</Label>
                <Input value={catForm.icon} onChange={(e) => updCat("icon", e.target.value)} placeholder="e.g. 🩺" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={catForm.description} onChange={(e) => updCat("description", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Sort Order</Label>
                <Input type="number" value={catForm.sort_order} onChange={(e) => updCat("sort_order", parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch checked={catForm.is_active} onCheckedChange={(v) => updCat("is_active", v)} />
                <Label className="text-sm">Active</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
            <Button onClick={saveCat} disabled={saving || !catForm.name}>{saving ? "Saving..." : editCat ? "Update" : "Add Category"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}