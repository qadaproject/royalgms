import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  Send, Truck, CheckCircle2, Bell, MapPin, ShieldCheck, Clock
} from "lucide-react";

const EVENT_ICONS = {
  invitation_dispatched: { icon: Send, color: "text-blue-600", bg: "bg-blue-500/10" },
  delivery_status_changed: { icon: Truck, color: "text-amber-600", bg: "bg-amber-500/10" },
  rsvp_status_changed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  notification_sent: { icon: Bell, color: "text-purple-600", bg: "bg-purple-500/10" },
  zone_assigned: { icon: MapPin, color: "text-rose-600", bg: "bg-rose-500/10" },
  protocol_validated: { icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
};

export default function GuestActivityLog({ guestId }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activityLogs", guestId],
    queryFn: () => base44.entities.GuestActivityLog.filter({ guest_id: guestId }, "-created_date", 50),
    enabled: !!guestId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No activity recorded yet</p>
        <p className="text-xs mt-1">Actions like dispatch, RSVP changes and notifications will appear here</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      {logs.map((log) => {
        const cfg = EVENT_ICONS[log.event_type] || { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" };
        const Icon = cfg.icon;
        return (
          <div key={log.id} className="flex gap-3 pb-4 relative">
            <div className={`relative z-10 w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 border border-border`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 pt-1.5 min-w-0">
              <p className="text-sm text-foreground">{log.description}</p>
              {(log.old_value || log.new_value) && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {log.old_value && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded line-through text-muted-foreground">{log.old_value}</span>}
                  {log.old_value && log.new_value && <span className="text-[10px] text-muted-foreground">→</span>}
                  {log.new_value && <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-medium">{log.new_value}</span>}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                {log.created_date ? format(new Date(log.created_date), "MMM d, yyyy · h:mm a") : ""}
                {log.performed_by && ` · ${log.performed_by}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}