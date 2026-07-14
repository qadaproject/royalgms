import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, X, FileImage } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import GuestActivityLog from "./GuestActivityLog";
import { getTierForCategory, TIER_LABELS } from "@/lib/guestTiers";

const categories = ["A - Royal", "B - Federal", "C - State", "D - Corporate", "E - Diplomatic", "F - Traditional", "G - General", "H - Socials", "I - Communities", "J - Chiefs"];
const salutations = ["His Imperial Majesty", "His Majesty", "Her Majesty", "His Royal Highness", "His Royal Majesty", "Her Royal Majesty", "His Excellency", "Her Excellency", "Senator", "Pastor", "Rt. Hon.", "Hon.", "Chief", "Dr.", "Prof.", "Engr.", "Barr.", "Alhaji", "Chief (Mrs.)", "Mr.", "Mrs.", "Ms."];

const emptyGuest = {
  formal_salutation: "",
  full_name: "",
  official_title: "",
  post_nominals: "",
  category: "G - General",
  tier: "",
  email: "",
  phone: "",
  contact_person_name: "",
  contact_person_phone: "",
  contact_person_email: "",
  honour_status: "",
  rsvp_status: "Pending",
  dietary_requirements: "",
  medical_alerts: "",
  security_detail_size: 0,
  arrival_details: "",
  special_requirements: "",
  protocol_validated: false,
  notes: "",
  gallery_urls: [],
};

export default function GuestFormDialog({ open, onOpenChange, guest, onSave }) {
  const [form, setForm] = useState(emptyGuest);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!guest?.id;

  useEffect(() => {
    if (guest) {
      setForm({ ...emptyGuest, ...guest });
    } else {
      setForm(emptyGuest);
    }
  }, [guest]);

  const handleSave = () => {
    onSave(form);
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploads = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
      const urls = uploads.map(r => r.file_url).filter(Boolean);
      setForm(prev => ({ ...prev, gallery_urls: [...(prev.gallery_urls || []), ...urls] }));
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (idx) => {
    setForm(prev => ({ ...prev, gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {isEdit ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className={`grid w-full ${isEdit ? "grid-cols-5" : "grid-cols-4"}`}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & Liaison</TabsTrigger>
            <TabsTrigger value="protocol">Protocol & Security</TabsTrigger>
            <TabsTrigger value="files">Files & Photos</TabsTrigger>
            {isEdit && <TabsTrigger value="activity">Activity Log</TabsTrigger>}
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Formal Salutation</Label>
                <Select value={form.formal_salutation} onValueChange={(v) => update("formal_salutation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {salutations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Category *</Label>
                <Select value={form.category} onValueChange={(v) => { update("category", v); update("tier", getTierForCategory(v)); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Internal Tier</Label>
              <Select value={form.tier || getTierForCategory(form.category)} onValueChange={(v) => update("tier", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIER_LABELS).map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">Internal classification — never shown on invitations or messages</p>
            </div>
            <div>
              <Label className="text-xs">Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Full legal name" />
            </div>
            <div>
              <Label className="text-xs">Official Title</Label>
              <Input value={form.official_title} onChange={(e) => update("official_title", e.target.value)} placeholder="e.g. Governor of Delta State" />
            </div>
            <div>
              <Label className="text-xs">Honour Status</Label>
              <Select value={form.honour_status || "none"} onValueChange={(v) => update("honour_status", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Guest of Honour">Guest of Honour</SelectItem>
                  <SelectItem value="Special Guest of Honour">Special Guest of Honour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">Displayed on the invitation card for Special Guest of Honour</p>
            </div>
            <div>
              <Label className="text-xs">Post-Nominals</Label>
              <Input value={form.post_nominals} onChange={(e) => update("post_nominals", e.target.value)} placeholder="e.g. CFR, OFR, GCON" />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">PA / Aide Contact</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Contact Person Name</Label>
                  <Input value={form.contact_person_name} onChange={(e) => update("contact_person_name", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Contact Phone</Label>
                    <Input value={form.contact_person_phone} onChange={(e) => update("contact_person_phone", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Contact Email</Label>
                    <Input type="email" value={form.contact_person_email} onChange={(e) => update("contact_person_email", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="protocol" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs">Dietary Requirements</Label>
              <Textarea value={form.dietary_requirements} onChange={(e) => update("dietary_requirements", e.target.value)} placeholder="Any dietary restrictions..." />
            </div>
            <div>
              <Label className="text-xs">Medical Alerts</Label>
              <Textarea value={form.medical_alerts} onChange={(e) => update("medical_alerts", e.target.value)} placeholder="Any medical conditions..." />
            </div>
            <div>
              <Label className="text-xs">Security Detail Size</Label>
              <Input type="number" min={0} value={form.security_detail_size} onChange={(e) => update("security_detail_size", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="text-xs">Arrival Details</Label>
              <Textarea value={form.arrival_details} onChange={(e) => update("arrival_details", e.target.value)} placeholder="Flight details or vehicle plates..." />
            </div>
            <div>
              <Label className="text-xs">Special Requirements</Label>
              <Textarea value={form.special_requirements} onChange={(e) => update("special_requirements", e.target.value)} placeholder="Security clearance or cultural etiquette..." />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm font-medium">Protocol Validated</Label>
                <p className="text-[10px] text-muted-foreground">Confirm title and address verification</p>
              </div>
              <Switch checked={form.protocol_validated} onCheckedChange={(v) => update("protocol_validated", v)} />
            </div>
            <div>
              <Label className="text-xs">Internal Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Photos & Documents</p>
                <p className="text-xs text-muted-foreground">Upload event photos, ID documents, or any relevant files for this guest.</p>
              </div>
              <label className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                    {uploading ? "Uploading..." : "Upload Files"}
                  </span>
                </Button>
                <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {(form.gallery_urls || []).length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
                <FileImage className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(form.gallery_urls || []).map((url, idx) => {
                  const isPdf = url.includes(".pdf") || url.includes("pdf");
                  return (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square flex items-center justify-center">
                      {isPdf ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 text-center">
                          <FileImage className="w-8 h-8 text-primary" />
                          <span className="text-[10px] text-muted-foreground truncate w-full">PDF Document</span>
                        </a>
                      ) : (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {isEdit && (
            <TabsContent value="activity" className="mt-4">
              <GuestActivityLog guestId={guest?.id} />
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.full_name || !form.category}>
            {isEdit ? "Update Guest" : "Add Guest"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}