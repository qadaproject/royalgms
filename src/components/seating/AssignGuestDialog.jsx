import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";

export default function AssignGuestDialog({ open, onOpenChange, zone, guests, onAssign }) {
  const [search, setSearch] = useState("");

  if (!zone) return null;

  // Only show accepted guests not yet assigned to this zone
  const available = guests.filter((g) => {
    const isAccepted = g.rsvp_status === "Accepted";
    const notAssigned = g.seating_zone !== zone.name;
    const matchesSearch = !search || g.full_name?.toLowerCase().includes(search.toLowerCase());
    // Check category restriction
    const categoryAllowed = !zone.categories_allowed?.length || zone.categories_allowed.includes(g.category);
    return isAccepted && notAssigned && matchesSearch && categoryAllowed;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Assign to {zone.name}</DialogTitle>
          <p className="text-xs text-muted-foreground">Select an accepted guest to assign</p>
        </DialogHeader>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="max-h-64 overflow-y-auto space-y-1 mt-3">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No eligible guests found</p>
          ) : (
            available.map((g) => (
              <div key={g.id} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{g.full_name}</p>
                  <CategoryBadge category={g.category} />
                </div>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => onAssign(g.id)}>
                  <UserPlus className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}