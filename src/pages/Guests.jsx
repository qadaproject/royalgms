import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import GuestTable from "../components/guests/GuestTable";
import GuestFilters from "../components/guests/GuestFilters";
import GuestFormDialog from "../components/guests/GuestFormDialog";
import GuestPrintMenu from "../components/guests/GuestPrintMenu";
import BulkRSVPAction from "../components/guests/BulkRSVPAction";
import GuestImportDialog from "../components/guests/GuestImportDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Guests() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [deleteGuest, setDeleteGuest] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [importOpen, setImportOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 1000),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Guest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setDialogOpen(false);
      setEditGuest(null);
      toast.success("Guest added successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Guest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setDialogOpen(false);
      setEditGuest(null);
      toast.success("Guest updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Guest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setDeleteGuest(null);
      toast.success("Guest removed");
    },
  });

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleAll = (visibleGuests) => {
    const allSelected = visibleGuests.every((g) => selectedIds.has(g.id));
    setSelectedIds(allSelected ? new Set() : new Set(visibleGuests.map((g) => g.id)));
  };

  const handleImportGuests = async (guestRows) => {
    // Process in batches of 10 with concurrency to avoid overwhelming the API
    const BATCH_SIZE = 10;
    for (let i = 0; i < guestRows.length; i += BATCH_SIZE) {
      const batch = guestRows.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((row) => base44.entities.Guest.create(row)));
    }
    queryClient.invalidateQueries({ queryKey: ["guests"] });
  };

  const handleBulkRSVP = async (ids, newStatus) => {
    await Promise.all(ids.map((id) => base44.entities.Guest.update(id, { rsvp_status: newStatus })));
    queryClient.invalidateQueries({ queryKey: ["guests"] });
    setSelectedIds(new Set());
  };

  const handleExportCSV = () => {
    const cols = [
      "full_name", "formal_salutation", "official_title", "post_nominals",
      "category", "rsvp_status", "email", "phone",
      "contact_person_name", "contact_person_phone", "contact_person_email",
      "seating_zone", "seat_number", "security_detail_size",
      "arrival_details", "dietary_requirements", "medical_alerts",
      "special_requirements", "protocol_validated", "notes", "qr_code",
    ];
    const header = cols.join(",");
    const rows = filteredGuests.map((g) =>
      cols.map((c) => {
        const val = g[c] ?? "";
        const str = String(val).replace(/"/g, '""');
        return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guest-registry-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = (form) => {
    if (editGuest?.id) {
      updateMutation.mutate({ id: editGuest.id, data: form });
    } else {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      // 10-char uppercase alphanumeric token used for both QR check-in and RSVP link
      const qrCode = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      createMutation.mutate({ ...form, qr_code: qrCode, rsvp_token: qrCode });
    }
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch = !search || 
      g.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      g.official_title?.toLowerCase().includes(search.toLowerCase()) ||
      g.formal_salutation?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All Categories" || g.category === category;
    const matchesStatus = status === "All Status" || g.rsvp_status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      <PageHeader title="Guest Registry" subtitle={`${guests.length} dignitaries registered`}>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <GuestPrintMenu guests={filteredGuests} invitations={invitations} />
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
        <Button onClick={() => { setEditGuest(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Guest
        </Button>
      </PageHeader>

      <GuestFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
      />

      <BulkRSVPAction
        selectedIds={selectedIds}
        guests={guests}
        onUpdate={handleBulkRSVP}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <GuestTable
          guests={filteredGuests}
          onEdit={(guest) => { setEditGuest(guest); setDialogOpen(true); }}
          onDelete={(guest) => setDeleteGuest(guest)}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
        />
      )}

      <GuestImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportGuests}
      />

      <GuestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        guest={editGuest}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteGuest} onOpenChange={() => setDeleteGuest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Guest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteGuest?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteGuest.id)} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}