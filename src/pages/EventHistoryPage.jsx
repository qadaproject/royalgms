import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Archive, Plus, Calendar, MapPin, Users, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";

export default function EventHistoryPage() {
  const [selected, setSelected] = useState("");
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["event_history"],
    queryFn: () => base44.entities.EventHistory.list("-event_date", 100),
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["event_settings"],
    queryFn: () => base44.entities.EventSettings.list("-created_date", 1),
  });

  const selectedEvent = history.find((h) => h.id === selected);

  const categoryBreakdown = selectedEvent?.category_breakdown
    ? JSON.parse(selectedEvent.category_breakdown)
    : null;

  return (
    <div>
      <PageHeader title="Event History" subtitle="View archived summaries of past concluded events">
        <Button variant="outline" onClick={() => setShowArchiveDialog(true)}>
          <Archive className="w-4 h-4 mr-2" />
          Archive Current Event
        </Button>
      </PageHeader>

      {/* Select event */}
      <div className="mb-8 max-w-sm">
        <Label className="text-xs mb-2 block">Select a Concluded Event</Label>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No archived events yet. Archive the current event when it concludes.</p>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an event..." />
            </SelectTrigger>
            <SelectContent>
              {history.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.event_name} — {h.event_date ? format(new Date(h.event_date), "dd MMM yyyy") : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedEvent && (
        <div className="space-y-6">
          {/* Header card */}
          <div className="bg-[#1a0a06]/40 border border-accent/30 rounded-xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-accent text-[10px] uppercase tracking-[0.3em] font-sans mb-1">Archived Event</p>
                <h2 className="font-heading text-2xl font-semibold">{selectedEvent.event_name}</h2>
                {selectedEvent.event_subtitle && <p className="text-muted-foreground text-sm mt-1">{selectedEvent.event_subtitle}</p>}
              </div>
              {selectedEvent.archived_by && (
                <Badge variant="outline" className="text-[10px]">Archived by {selectedEvent.archived_by}</Badge>
              )}
            </div>
          </div>

          {/* Event info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Calendar, label: "Date", value: selectedEvent.event_date ? format(new Date(selectedEvent.event_date), "EEEE, dd MMMM yyyy") : "—" },
              { icon: Clock, label: "Time", value: selectedEvent.event_time || "—" },
              { icon: MapPin, label: "Venue", value: selectedEvent.venue_name || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <Card key={label}>
                <CardContent className="pt-4 flex items-start gap-3">
                  <Icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="font-medium text-sm mt-0.5">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Invited", value: selectedEvent.total_invited ?? "—", icon: Users, color: "text-primary" },
              { label: "Attended", value: selectedEvent.total_attended ?? "—", icon: CheckCircle2, color: "text-emerald-600" },
              { label: "RSVP Accepted", value: selectedEvent.rsvp_accepted ?? "—", icon: CheckCircle2, color: "text-blue-600" },
              { label: "RSVP Declined", value: selectedEvent.rsvp_declined ?? "—", icon: XCircle, color: "text-red-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-5 pb-4 text-center">
                  <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold font-heading">{value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base">Guest Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(categoryBreakdown).map(([cat, count]) => (
                    <div key={cat} className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold font-heading">{count}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{cat}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedEvent.notes && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="font-heading text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.notes}</p></CardContent>
            </Card>
          )}
        </div>
      )}

      <ArchiveEventDialog
        open={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        currentSettings={settings[0]}
        guests={guests}
        queryClient={queryClient}
      />
    </div>
  );
}

function ArchiveEventDialog({ open, onClose, currentSettings, guests, queryClient }) {
  const now = currentSettings || {};
  const [form, setForm] = useState({
    event_name: now.event_name || "",
    event_subtitle: now.event_subtitle || "",
    event_date: now.event_date || "",
    event_time: now.event_time || "",
    venue_name: now.venue_name || "",
    venue_address: now.venue_address || "",
    notes: "",
  });

  // Auto compute stats
  const total_invited = guests.length;
  const rsvp_accepted = guests.filter((g) => g.rsvp_status === "Accepted").length;
  const rsvp_declined = guests.filter((g) => g.rsvp_status === "Declined").length;
  const rsvp_pending = guests.filter((g) => g.rsvp_status === "Pending").length;
  const rsvp_proxy = guests.filter((g) => g.rsvp_status === "Proxy").length;
  const total_attended = guests.filter((g) => g.rsvp_status === "Accepted").length; // approximation

  const cats = guests.reduce((acc, g) => { acc[g.category] = (acc[g.category] || 0) + 1; return acc; }, {});

  const archiveMutation = useMutation({
    mutationFn: (data) => base44.entities.EventHistory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_history"] });
      toast.success("Event archived successfully");
      onClose();
    },
  });

  const handleArchive = () => {
    archiveMutation.mutate({
      ...form,
      total_invited,
      total_attended,
      rsvp_accepted,
      rsvp_declined,
      rsvp_pending,
      rsvp_proxy,
      category_breakdown: JSON.stringify(cats),
      archived_by: "Admin",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Archive className="w-5 h-5 text-accent" /> Archive Current Event
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">This will snapshot the current event data. The following stats are auto-computed from the live guest registry.</p>
          <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-lg p-4 text-sm">
            {[
              ["Total Invited", total_invited],
              ["RSVP Accepted", rsvp_accepted],
              ["RSVP Declined", rsvp_declined],
              ["RSVP Pending", rsvp_pending],
              ["Proxy", rsvp_proxy],
              ["Attended (est.)", total_attended],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
          </div>
          <div>
            <Label className="text-xs">Event Name</Label>
            <Input value={form.event_name} onChange={(e) => setForm(p => ({ ...p, event_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Event Date</Label>
              <Input type="date" value={form.event_date} onChange={(e) => setForm(p => ({ ...p, event_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Time</Label>
              <Input value={form.event_time} onChange={(e) => setForm(p => ({ ...p, event_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Venue</Label>
            <Input value={form.venue_name} onChange={(e) => setForm(p => ({ ...p, venue_name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any additional notes about this event..." className="h-20" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleArchive} disabled={archiveMutation.isPending} className="flex-1">
              {archiveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
              Archive Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}