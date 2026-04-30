import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import GuestTable from "../components/guests/GuestTable";
import GuestFilters from "../components/guests/GuestFilters";
import GuestFormDialog from "../components/guests/GuestFormDialog";
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

  const queryClient = useQueryClient();

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
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

  const handleSave = (form) => {
    if (editGuest?.id) {
      updateMutation.mutate({ id: editGuest.id, data: form });
    } else {
      // Generate a unique QR code identifier
      const qrCode = `RGMS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      createMutation.mutate({ ...form, qr_code: qrCode });
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <GuestTable
          guests={filteredGuests}
          onEdit={(guest) => { setEditGuest(guest); setDialogOpen(true); }}
          onDelete={(guest) => setDeleteGuest(guest)}
        />
      )}

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