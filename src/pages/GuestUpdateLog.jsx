import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, User } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";
import CategoryBadge from "../components/shared/CategoryBadge";

const EVENT_LABELS = {
  invitation_dispatched: "Invitation Dispatched",
  delivery_status_changed: "Delivery Status Changed",
  rsvp_status_changed: "RSVP / Itinerary Updated",
  notification_sent: "Notification Sent",
  zone_assigned: "Zone Assigned",
  protocol_validated: "Protocol Validated",
  link_accessed: "Link Accessed",
};

const EVENT_COLORS = {
  rsvp_status_changed: "text-blue-600 border-blue-500/30 bg-blue-500/5",
  notification_sent: "text-emerald-600 border-emerald-500/30 bg-emerald-500/5",
  invitation_dispatched: "text-amber-600 border-amber-500/30 bg-amber-500/5",
  delivery_status_changed: "text-purple-600 border-purple-500/30 bg-purple-500/5",
  zone_assigned: "text-cyan-600 border-cyan-500/30 bg-cyan-500/5",
  protocol_validated: "text-pink-600 border-pink-500/30 bg-pink-500/5",
  link_accessed: "text-indigo-600 border-indigo-500/30 bg-indigo-500/5",
};

export default function GuestUpdateLog() {
  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterPerformedBy, setFilterPerformedBy] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["guest_activity_logs"],
    queryFn: () => base44.entities.GuestActivityLog.list("-created_date", 500),
    refetchInterval: 30000,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
  });

  const guestMap = useMemo(() => {
    const m = {};
    guests.forEach((g) => { m[g.id] = g; });
    return m;
  }, [guests]);

  const filtered = useMemo(() => {
    let result = logs;
    if (filterEvent !== "all") result = result.filter((l) => l.event_type === filterEvent);
    if (filterPerformedBy !== "all") {
      const isPortal = filterPerformedBy === "portal";
      result = result.filter((l) => isPortal ? l.performed_by === "Guest Portal" : l.performed_by !== "Guest Portal");
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        (l.guest_name || "").toLowerCase().includes(q) ||
        (l.description || "").toLowerCase().includes(q) ||
        (l.new_value || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, search, filterEvent, filterPerformedBy]);

  return (
    <div>
      <PageHeader title="Guest Update Log" subtitle="Searchable record of all guest activity and self-submitted updates" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, description..." className="pl-8 h-9 text-sm" />
        </div>
        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Types</SelectItem>
            {Object.entries(EVENT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPerformedBy} onValueChange={setFilterPerformedBy}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="portal">Guest Portal</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="h-9 px-3 flex items-center text-xs">{filtered.length} records</Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading activity log...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No activity records found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const guest = guestMap[log.guest_id];
            const colorClass = EVENT_COLORS[log.event_type] || "text-muted-foreground border-border";
            const isPortal = log.performed_by === "Guest Portal";
            return (
              <div key={log.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.guest_name}</span>
                        {guest?.category && <CategoryBadge category={guest.category} compact />}
                        {isPortal && (
                          <Badge variant="outline" className="text-[9px] text-blue-600 border-blue-400/30 bg-blue-500/5">Guest Self-Update</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{log.description}</p>
                      {log.source && (
                        <span className="inline-block mt-1 text-[10px] text-indigo-600 bg-indigo-500/5 border border-indigo-500/20 rounded px-1.5 py-0.5 font-medium">
                          Source: {log.source}{log.page ? ` · ${log.page}` : ""}
                        </span>
                      )}
                      {(log.old_value || log.new_value) && (
                        <div className="mt-2 flex gap-3 flex-wrap text-xs">
                          {log.old_value && (
                            <span className="text-muted-foreground bg-muted/40 rounded px-2 py-0.5 font-mono max-w-xs truncate">
                              Before: {log.old_value.length > 80 ? log.old_value.substring(0, 80) + "…" : log.old_value}
                            </span>
                          )}
                          {log.new_value && (
                            <span className="text-emerald-700 bg-emerald-500/5 border border-emerald-500/20 rounded px-2 py-0.5 font-mono max-w-xs truncate">
                              After: {log.new_value.length > 80 ? log.new_value.substring(0, 80) + "…" : log.new_value}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant="outline" className={`text-[9px] ${colorClass}`}>
                      {EVENT_LABELS[log.event_type] || log.event_type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.created_date ? format(new Date(log.created_date), "dd MMM yyyy, HH:mm") : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}