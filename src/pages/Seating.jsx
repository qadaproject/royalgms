import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Map, Building2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import ZoneCard from "../components/seating/ZoneCard";
import ZoneFormDialog from "../components/seating/ZoneFormDialog";
import AssignGuestDialog from "../components/seating/AssignGuestDialog";
import SeatingChartView from "../components/seating/SeatingChartView";
import FloorPlanView from "../components/seating/FloorPlanView";

export default function Seating() {
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [editZone, setEditZone] = useState(null);
  const [assignZone, setAssignZone] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "chart" | "floorplan"

  const queryClient = useQueryClient();

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: () => base44.entities.SeatingZone.list("-created_date", 100),
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 500),
  });

  const createZoneMutation = useMutation({
    mutationFn: (data) => base44.entities.SeatingZone.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setZoneDialogOpen(false);
      toast.success("Zone created");
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SeatingZone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      setZoneDialogOpen(false);
      setEditZone(null);
      toast.success("Zone updated");
    },
  });

  const assignGuestMutation = useMutation({
    mutationFn: ({ guestId, zoneName }) => base44.entities.Guest.update(guestId, { seating_zone: zoneName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success("Guest assigned to zone");
    },
  });

  const handleSaveZone = (form) => {
    if (editZone?.id) {
      updateZoneMutation.mutate({ id: editZone.id, data: form });
    } else {
      createZoneMutation.mutate(form);
    }
  };

  return (
    <div>
      <PageHeader title="Seating & Protocol" subtitle="Manage zones and assign guests">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${viewMode === "cards" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${viewMode === "chart" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Map className="w-3.5 h-3.5" /> Chart View
            </button>
            <button
              onClick={() => setViewMode("floorplan")}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${viewMode === "floorplan" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Building2 className="w-3.5 h-3.5" /> Floor Plan
            </button>
          </div>
          <Button onClick={() => { setEditZone(null); setZoneDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Zone
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : zones.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-heading">No seating zones yet</p>
          <p className="text-sm mt-1">Create your first zone to start assigning guests</p>
        </div>
      ) : viewMode === "floorplan" ? (
        <FloorPlanView zones={zones} guests={guests} />
      ) : viewMode === "chart" ? (
        <SeatingChartView zones={zones} guests={guests} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {zones.map((zone) => {
            const assigned = guests.filter((g) => g.seating_zone === zone.name && g.rsvp_status === "Accepted");
            return (
              <ZoneCard
                key={zone.id}
                zone={zone}
                assignedGuests={assigned}
                onEdit={() => { setEditZone(zone); setZoneDialogOpen(true); }}
                onAssign={() => setAssignZone(zone)}
              />
            );
          })}
        </div>
      )}

      <ZoneFormDialog
        open={zoneDialogOpen}
        onOpenChange={setZoneDialogOpen}
        zone={editZone}
        onSave={handleSaveZone}
      />

      <AssignGuestDialog
        open={!!assignZone}
        onOpenChange={() => setAssignZone(null)}
        zone={assignZone}
        guests={guests}
        invitations={invitations}
        onAssign={(guestId) => assignGuestMutation.mutate({ guestId, zoneName: assignZone.name })}
      />
    </div>
  );
}