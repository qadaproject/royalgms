import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuestActivityLog from "./GuestActivityLog";

const categories = ["A - Royal", "B - Federal", "C - State", "D - Corporate", "E - Diplomatic", "F - Traditional", "G - General"];
const salutations = ["His Royal Majesty", "Her Royal Majesty", "His Excellency", "Her Excellency", "Rt. Hon.", "Hon.", "Chief", "Dr.", "Prof.", "Engr.", "Barr.", "Alhaji", "Chief (Mrs.)", "Mr.", "Mrs.", "Ms."];

const emptyGuest = {
  formal_salutation: "",
  full_name: "",
  official_title: "",
  post_nominals: "",
  category: "G - General",
  email: "",
  phone: "",
  contact_person_name: "",
  contact_person_phone: "",
  contact_person_email: "",
  rsvp_status: "Pending",
  dietary_requirements: "",
  medical_alerts: "",
  security_detail_size: 0,
  arrival_details: "",
  special_requirements: "",
  protocol_validated: false,
  notes: "",
};

export default function GuestFormDialog({ open, onOpenChange, guest, onSave }) {
  const [form, setForm] = useState(emptyGuest);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {isEdit ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className={`grid w-full ${isEdit ? "grid-cols-4" : "grid-cols-3"}`}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & Liaison</TabsTrigger>
            <TabsTrigger value="protocol">Protocol & Security</TabsTrigger>
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
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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