import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, ShieldCheck, ShieldAlert, Link2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import CategoryBadge from "../shared/CategoryBadge";
import StatusBadge from "../shared/StatusBadge";
import { getTierForCategory, TIER_STYLES } from "@/lib/guestTiers";
import GuestViewModal from "./GuestViewModal";

const PAGE_SIZE = 20;

function copyRSVPLink(guest) {
  if (!guest.qr_code) { toast.error("No RSVP token yet. Re-save the guest."); return; }
  const link = `${window.location.origin}/rsvp?token=${guest.qr_code}`;
  navigator.clipboard.writeText(link);
  toast.success("RSVP link copied");
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-2 py-2">
      <span className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onPage(1)} disabled={page === 1} className="h-7 px-2 text-xs">«</Button>
        <Button variant="outline" size="sm" onClick={() => onPage(page - 1)} disabled={page === 1} className="h-7 w-7 p-0">
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPage(p)}
              className="h-7 w-7 p-0 text-xs"
            >
              {p}
            </Button>
          );
        })}
        <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={page === totalPages} className="h-7 w-7 p-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPage(totalPages)} disabled={page === totalPages} className="h-7 px-2 text-xs">»</Button>
      </div>
    </div>
  );
}

export default function GuestTable({ guests, onEdit, onDelete, selectedIds = new Set(), onToggleSelect, onToggleAll }) {
  const [page, setPage] = useState(1);
  const [viewGuest, setViewGuest] = useState(null);

  // Reset to page 1 whenever the guest list changes (filter applied)
  useEffect(() => { setPage(1); }, [guests.length]);

  const totalPages = Math.max(1, Math.ceil(guests.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGuests = guests.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allSelected = pageGuests.length > 0 && pageGuests.every((g) => selectedIds.has(g.id));
  const someSelected = pageGuests.some((g) => selectedIds.has(g.id));

  if (guests.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-heading">No guests found</p>
        <p className="text-sm mt-1">Add your first guest to get started</p>
      </div>
    );
  }

  return (
    <>
    <GuestViewModal guest={viewGuest} open={!!viewGuest} onOpenChange={(v) => { if (!v) setViewGuest(null); }} />
    <div className="space-y-2">
      {/* Top pagination */}
      <div className="border rounded-lg bg-muted/20">
        <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => onToggleAll && onToggleAll(pageGuests)}
                  aria-label="Select all"
                  className={someSelected && !allSelected ? "opacity-50" : ""}
                />
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Guest</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Category</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold hidden md:table-cell">Tier</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold">RSVP</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold hidden md:table-cell">Protocol</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold hidden lg:table-cell">Contact Person</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageGuests.map((guest) => (
              <TableRow key={guest.id} className={`group hover:bg-muted/30 transition-colors ${selectedIds.has(guest.id) ? "bg-accent/5" : ""}`}>
                <TableCell className="w-10">
                  <Checkbox
                    checked={selectedIds.has(guest.id)}
                    onCheckedChange={() => onToggleSelect && onToggleSelect(guest.id)}
                    aria-label={`Select ${guest.full_name}`}
                  />
                </TableCell>
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
                <TableCell className="hidden md:table-cell">
                  {(() => {
                    const t = guest.tier || getTierForCategory(guest.category);
                    return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${TIER_STYLES[t] || ""}`}>{t}</span>;
                  })()}
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="View Details" onClick={() => setViewGuest(guest)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
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

      {/* Bottom pagination */}
      <div className="border rounded-lg bg-muted/20">
        <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
    </>
  );
}