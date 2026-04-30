import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import { format } from "date-fns";

const tierStyles = {
  "Tier 1 - Gold Foil": "bg-accent/20 text-accent border-accent/30",
  "Tier 2 - Wax Seal": "bg-rose-500/10 text-rose-700 border-rose-500/20",
  "Tier 3 - Digital": "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

export default function InvitationTable({ invitations, onUpdateDelivery }) {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-heading">No invitations found</p>
        <p className="text-sm mt-1">Create a new dispatch to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Guest</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Tier</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Method</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Delivery</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold hidden md:table-cell">Courier</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold hidden md:table-cell">Date</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((inv) => (
            <TableRow key={inv.id} className="group hover:bg-muted/30 transition-colors">
              <TableCell>
                <p className="text-sm font-medium">{inv.guest_name}</p>
                <p className="text-[10px] text-muted-foreground">{inv.guest_category}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-[10px] border ${tierStyles[inv.tier] || ""}`}>
                  {inv.tier}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">{inv.dispatch_type}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={inv.delivery_status || "Pending"} type="delivery" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-xs text-muted-foreground">{inv.courier_name || "—"}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-xs text-muted-foreground">
                  {inv.delivered_date ? format(new Date(inv.delivered_date), "MMM d, yyyy") : "—"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onUpdateDelivery(inv)}
                >
                  <Truck className="w-3.5 h-3.5 mr-1" />
                  Update
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}