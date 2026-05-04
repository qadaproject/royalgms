import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, AlertTriangle } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";

// Map tier → allowed categories
const TIER_CATEGORY_MAP = {
  "Tier 1 - Gold Foil": ["A - Royal", "B - Federal", "E - Diplomatic"],
  "Tier 2 - Wax Seal": ["C - State", "D - Corporate", "E - Diplomatic", "F - Traditional"],
  "Tier 3 - Digital": ["D - Corporate", "G - General"],
};

function getValidationWarning(guest, zone, invitations) {
  const guestInvite = invitations?.find((inv) => inv.guest_id === guest.id);

  // Category check
  if (zone.categories_allowed?.length && !zone.categories_allowed.includes(guest.category)) {
    return `${guest.category} guests are not permitted in ${zone.name}`;
  }

  // Tier check
  if (guestInvite) {
    const allowedCats = TIER_CATEGORY_MAP[guestInvite.tier] || [];
    if (allowedCats.length && !allowedCats.includes(guest.category)) {
      return `${guestInvite.tier} invitation does not match this guest's category`;
    }
  }

  return null;
}

export default function AssignGuestDialog({ open, onOpenChange, zone, guests, invitations = [], onAssign }) {
  const [search, setSearch] = useState("");
  const [pendingGuest, setPendingGuest] = useState(null);
  const [warning, setWarning] = useState("");

  if (!zone) return null;

  // Show all accepted guests not yet assigned to this zone (removed hard category filter so warnings show)
  const available = guests.filter((g) => {
    const isAccepted = g.rsvp_status === "Accepted";
    const notAssigned = g.seating_zone !== zone.name;
    const matchesSearch = !search || g.full_name?.toLowerCase().includes(search.toLowerCase());
    return isAccepted && notAssigned && matchesSearch;
  });

  const handleAssignClick = (g) => {
    const warn = getValidationWarning(g, zone, invitations);
    if (warn) {
      setPendingGuest(g);
      setWarning(warn);
    } else {
      onAssign(g.id);
    }
  };

  const confirmAssign = () => {
    if (pendingGuest) onAssign(pendingGuest.id);
    setPendingGuest(null);
    setWarning("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setPendingGuest(null); setWarning(""); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Assign to {zone.name}</DialogTitle>
          <p className="text-xs text-muted-foreground">Select an accepted guest to assign</p>
        </DialogHeader>

        {/* Validation warning overlay */}
        {pendingGuest && (
          <div className="rounded-lg border border-amber-400/40 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Protocol Mismatch Warning</p>
                <p className="text-xs text-amber-700 mt-0.5">{warning}</p>
                <p className="text-xs text-amber-600 mt-1">Assigning <strong>{pendingGuest.full_name}</strong> may violate seating protocol. Proceed anyway?</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => { setPendingGuest(null); setWarning(""); }}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={confirmAssign}>Override & Assign</Button>
            </div>
          </div>
        )}

        {!pendingGuest && (
          <>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 mt-3">
              {available.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No eligible guests found</p>
              ) : (
                available.map((g) => {
                  const warn = getValidationWarning(g, zone, invitations);
                  return (
                    <div key={g.id} className={`flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors ${warn ? "border border-amber-300/50 bg-amber-50/40" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{g.full_name}</p>
                          {warn && <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" title={warn} />}
                        </div>
                        <CategoryBadge category={g.category} />
                      </div>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => handleAssignClick(g)}>
                        <UserPlus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}