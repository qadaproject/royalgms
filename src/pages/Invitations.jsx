import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import InvitationTable from "../components/invitations/InvitationTable";
import InvitationFilters from "../components/invitations/InvitationFilters";
import CreateInvitationDialog from "../components/invitations/CreateInvitationDialog";
import UpdateDeliveryDialog from "../components/invitations/UpdateDeliveryDialog";

export default function Invitations() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [createOpen, setCreateOpen] = useState(false);
  const [updateInvite, setUpdateInvite] = useState(null);

  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 500),
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
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
    mutationFn: ({ id, data }) => base44.entities.Invitation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setUpdateInvite(null);
      toast.success("Delivery status updated");
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
        onSave={(id, data) => updateMutation.mutate({ id, data })}
      />
    </div>
  );
}