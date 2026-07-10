import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Loader2, X, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const RSVP_STATUSES = ["Accepted", "Pending", "Declined", "Proxy"];
const DELIVERY_STATUSES = ["Pending", "Out for Delivery", "Delivered", "Returned", "Failed"];

export default function BulkRSVPAction({ selectedIds, guests, invitations, onUpdateRSVP, onUpdateDelivery, onClearRSVP, onClearSelection }) {
  const [loading, setLoading] = useState(false);

  if (selectedIds.size === 0) return null;

  const run = async (label, fn) => {
    setLoading(true);
    await fn();
    setLoading(false);
    toast.success(label);
  };

  const handleRSVP = (status) => run(
    `Set RSVP to "${status}" for ${selectedIds.size} guest(s)`,
    () => onUpdateRSVP(Array.from(selectedIds), status)
  );

  const handleClearRSVP = () => run(
    `Cleared RSVP for ${selectedIds.size} guest(s) → Pending`,
    () => onClearRSVP(Array.from(selectedIds))
  );

  const handleDelivery = (status) => run(
    `Set delivery to "${status}" for ${selectedIds.size} guest(s)`,
    () => onUpdateDelivery(Array.from(selectedIds), status)
  );

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-lg mb-4 flex-wrap">
      <CheckSquare className="w-4 h-4 text-accent shrink-0" />
      <span className="text-sm font-medium text-foreground">{selectedIds.size} guest{selectedIds.size !== 1 ? "s" : ""} selected</span>

      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {/* RSVP Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs" disabled={loading}>
              Set RSVP <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">RSVP Status</DropdownMenuLabel>
            {RSVP_STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => handleRSVP(s)}>{s}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearRSVP} className="text-amber-600">
              Clear → Reset to Pending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Invitation Delivery Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 text-xs" disabled={loading}>
              Set Delivery <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Delivery Status</DropdownMenuLabel>
            {DELIVERY_STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => handleDelivery(s)}>{s}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}

        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClearSelection} title="Clear selection">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}