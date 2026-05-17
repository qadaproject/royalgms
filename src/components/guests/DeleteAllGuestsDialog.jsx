import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteAllGuestsDialog({ open, onOpenChange, totalCount, onConfirm }) {
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
    setTyped("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setTyped("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" /> Delete Entire Guest List
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">This action cannot be undone</p>
              <p className="text-xs text-muted-foreground mt-1">
                You are about to permanently delete all <strong>{totalCount} guests</strong> from the registry. All associated data including RSVP status, seating assignments, and QR codes will be lost.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              To confirm, type <span className="font-bold text-foreground">delete</span> below:
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type delete to confirm"
              className="border-destructive/50 focus-visible:ring-destructive"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t">
            <Button variant="outline" onClick={handleClose} disabled={deleting}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={typed.trim().toLowerCase() !== "delete" || deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {deleting ? "Deleting…" : `Delete All ${totalCount} Guests`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}