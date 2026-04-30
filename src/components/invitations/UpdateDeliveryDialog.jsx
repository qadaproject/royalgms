import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const deliveryStatuses = ["Pending", "Out for Delivery", "Delivered", "Returned", "Failed"];

export default function UpdateDeliveryDialog({ invitation, open, onOpenChange, onSave }) {
  const [status, setStatus] = useState("Pending");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (invitation) {
      setStatus(invitation.delivery_status || "Pending");
      setDate(invitation.delivered_date || "");
      setNotes(invitation.dispatch_notes || "");
      setTrackingNumber(invitation.tracking_number || "");
    }
  }, [invitation]);

  const handleSave = () => {
    onSave(invitation.id, {
      delivery_status: status,
      delivered_date: date || undefined,
      dispatch_notes: notes,
      tracking_number: trackingNumber,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Update Delivery</DialogTitle>
          <p className="text-sm text-muted-foreground">{invitation?.guest_name}</p>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Delivery Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {deliveryStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Delivered Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Tracking Number</Label>
            <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Update Status</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}