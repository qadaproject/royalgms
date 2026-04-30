import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const dispatchTypes = ["Physical - Hand Delivered", "Physical - Courier", "Digital - Email", "Digital - SMS"];
const tiers = ["Tier 1 - Gold Foil", "Tier 2 - Wax Seal", "Tier 3 - Digital"];

export default function CreateInvitationDialog({ open, onOpenChange, guests, invitations, onSave }) {
  const [guestId, setGuestId] = useState("");
  const [dispatchType, setDispatchType] = useState("");
  const [tier, setTier] = useState("");
  const [courierName, setCourierName] = useState("");
  const [notes, setNotes] = useState("");

  // Filter out guests who already have invitations
  const existingGuestIds = new Set(invitations.map((i) => i.guest_id));
  const availableGuests = guests.filter((g) => !existingGuestIds.has(g.id));

  const selectedGuest = guests.find((g) => g.id === guestId);

  const handleSave = () => {
    if (!guestId || !dispatchType || !tier) return;
    onSave({
      guest_id: guestId,
      guest_name: selectedGuest?.full_name || "",
      guest_category: selectedGuest?.category || "",
      dispatch_type: dispatchType,
      tier,
      courier_name: courierName,
      dispatch_notes: notes,
      delivery_status: "Pending",
    });
    setGuestId("");
    setDispatchType("");
    setTier("");
    setCourierName("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">New Dispatch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Select Guest *</Label>
            <Select value={guestId} onValueChange={setGuestId}>
              <SelectTrigger><SelectValue placeholder="Choose a guest..." /></SelectTrigger>
              <SelectContent>
                {availableGuests.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.formal_salutation} {g.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Invitation Tier *</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger><SelectValue placeholder="Select tier..." /></SelectTrigger>
              <SelectContent>
                {tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Dispatch Method *</Label>
            <Select value={dispatchType} onValueChange={setDispatchType}>
              <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
              <SelectContent>
                {dispatchTypes.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Courier / Delivery Person</Label>
            <Input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Name of courier..." />
          </div>
          <div>
            <Label className="text-xs">Dispatch Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!guestId || !dispatchType || !tier}>
              Create Dispatch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}