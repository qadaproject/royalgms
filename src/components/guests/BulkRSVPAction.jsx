import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const RSVP_STATUSES = ["Accepted", "Pending", "Declined", "Proxy"];

export default function BulkRSVPAction({ selectedIds, guests, onUpdate, onClearSelection }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (selectedIds.size === 0) return null;

  const handleApply = async () => {
    if (!status) { toast.error("Select a status first"); return; }
    setLoading(true);
    await onUpdate(Array.from(selectedIds), status);
    setStatus("");
    setLoading(false);
    toast.success(`Updated ${selectedIds.size} guest(s) to "${status}"`);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-lg mb-4">
      <CheckSquare className="w-4 h-4 text-accent shrink-0" />
      <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
      <div className="flex items-center gap-2 ml-auto">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Set RSVP status" />
          </SelectTrigger>
          <SelectContent>
            {RSVP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8 text-xs" disabled={loading || !status} onClick={handleApply}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
          Apply
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClearSelection}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}