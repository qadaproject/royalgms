import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ShieldCheck, ShieldAlert, Link2 } from "lucide-react";
import { toast } from "sonner";
import CategoryBadge from "../shared/CategoryBadge";
import StatusBadge from "../shared/StatusBadge";

function copyRSVPLink(guest) {
  if (!guest.qr_code) { toast.error("No RSVP token yet. Re-save the guest."); return; }
  const link = `${window.location.origin}/rsvp?token=${guest.qr_code}`;
  navigator.clipboard.writeText(link);
  toast.success("RSVP link copied");
}

export default function GuestTable({ guests, onEdit, onDelete }) {
  if (guests.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-heading">No guests found</p>
        <p className="text-sm mt-1">Add your first guest to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Guest</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Category</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold">RSVP</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold hidden md:table-cell">Protocol</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold hidden lg:table-cell">Contact Person</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id} className="group hover:bg-muted/30 transition-colors">
              <TableCell>
                <div>
                  <p className="text-sm font-medium">
                    {guest.formal_salutation && (
                      <span className="text-muted-foreground">{guest.formal_salutation} </span>
                    )}
                    {guest.full_name}
                  </p>
                  {guest.official_title && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{guest.official_title}</p>
                  )}
                  {guest.post_nominals && (
                    <p className="text-[10px] text-accent font-medium">{guest.post_nominals}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <CategoryBadge category={guest.category} />
              </TableCell>
              <TableCell>
                <StatusBadge status={guest.rsvp_status || "Pending"} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {guest.protocol_validated ? (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">Validated</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">Pending</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <p className="text-xs text-muted-foreground">{guest.contact_person_name || "—"}</p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" title="Copy RSVP Link" onClick={() => copyRSVPLink(guest)}>
                    <Link2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(guest)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(guest)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}