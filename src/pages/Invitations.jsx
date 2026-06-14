import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import InvitationTable from "../components/invitations/InvitationTable";
import InvitationFilters from "../components/invitations/InvitationFilters";
import CreateInvitationDialog from "../components/invitations/CreateInvitationDialog";
import UpdateDeliveryDialog from "../components/invitations/UpdateDeliveryDialog";
import InvitationPDFExport from "../components/invitations/InvitationPDFExport";
import BulkPrintExport from "../components/invitations/BulkPrintExport";

export default function Invitations() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [createOpen, setCreateOpen] = useState(false);
  const [updateInvite, setUpdateInvite] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkPrintOpen, setBulkPrintOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 10000),
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 10000),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Invitation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setCreateOpen(false);
      toast.success("Invitation dispatched");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, prev }) =>
      base44.entities.Invitation.update(id, data).then((res) => ({ res, data, prev })),
    onSuccess: ({ data, prev }) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setUpdateInvite(null);
      toast.success("Delivery status updated");
      // Write activity log entry if status changed
      if (prev && data.delivery_status && data.delivery_status !== prev.delivery_status) {
        base44.entities.GuestActivityLog.create({
          guest_id: prev.guest_id,
          guest_name: prev.guest_name,
          event_type: "delivery_status_changed",
          description: `Invitation delivery status updated`,
          old_value: prev.delivery_status,
          new_value: data.delivery_status,
        }).catch(() => {});

        // Auto-send email when status changes to "Delivered"
        if (data.delivery_status === "Delivered") {
          base44.entities.Guest.filter({ id: prev.guest_id }, "-created_date", 1)
            .then(async ([guest]) => {
              if (!guest?.email) return;
              const link = `${window.location.origin}/rsvp?token=${guest.qr_code}`;
              await base44.integrations.Core.SendEmail({
                to: guest.email,
                subject: `Your Royal Invitation has been dispatched`,
                body: `Dear ${guest.formal_salutation || ""} ${guest.full_name},\n\nYour official invitation to the 5th Coronation Anniversary of Ògíame Atúwàtse III, CFR has been dispatched.\n\nPlease confirm your attendance via your personal RSVP link:\n${link}\n\nThe Royal Protocol Office\nWarri Kingdom`,
              });
              toast.success(`Invitation email sent to ${guest.full_name}`);
            })
            .catch(() => {});
        }
      }
    },
  });

  const filtered = invitations.filter((inv) => {
    const matchSearch = !search || inv.guest_name?.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === "All Tiers" || inv.tier === tierFilter;
    const matchStatus = statusFilter === "All Status" || inv.delivery_status === statusFilter;
    return matchSearch && matchTier && matchStatus;
  });

  return (
    <div>
      <PageHeader title="Dispatch Tracker" subtitle={`${invitations.length} invitations tracked`}>
        <Button variant="outline" onClick={() => setBulkPrintOpen(true)}>
          <Printer className="w-4 h-4 mr-2" />
          Bulk Print
        </Button>
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          <Printer className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Dispatch
        </Button>
      </PageHeader>

      <InvitationFilters
        search={search}
        setSearch={setSearch}
        tier={tierFilter}
        setTier={setTierFilter}
        status={statusFilter}
        setStatus={setStatusFilter}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <InvitationTable
          invitations={filtered}
          onUpdateDelivery={(inv) => setUpdateInvite(inv)}
        />
      )}

      <CreateInvitationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        guests={guests}
        invitations={invitations}
        onSave={(data) => createMutation.mutate(data)}
      />

      <UpdateDeliveryDialog
        invitation={updateInvite}
        open={!!updateInvite}
        onOpenChange={() => setUpdateInvite(null)}
        onSave={(id, data) => updateMutation.mutate({ id, data, prev: updateInvite })}
      />

      <InvitationPDFExport
        open={exportOpen}
        onOpenChange={setExportOpen}
        guests={guests}
        invitations={invitations}
      />

      <BulkPrintExport
        open={bulkPrintOpen}
        onOpenChange={setBulkPrintOpen}
        invitations={filtered}
        guests={guests}
      />
    </div>
  );
}