import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, XCircle, Clock, MapPin } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";
import { format } from "date-fns";

const STATUS_CONFIG = {
  Accepted: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  Pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  Declined: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", badge: "bg-red-100 text-red-700" },
  Proxy: { icon: Shield, color: "text-blue-600", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
};

export default function SecurityActivityFeed() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["guest-activity-logs-checkin"],
    queryFn: () =>
      base44.entities.GuestActivityLog.filter(
        { event_type: "rsvp_status_changed" },
        "-created_date",
        100
      ),
    refetchInterval: 15000,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
  });

  const guestMap = Object.fromEntries(guests.map((g) => [g.id, g]));

  // Filter only check-in events (status changed to Accepted)
  const checkInLogs = logs.filter((l) => l.new_value === "Accepted");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Security Check-in Activity
          <Badge variant="secondary" className="ml-auto text-xs">{checkInLogs.length} check-ins</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Live log of all guest verifications via Security Checkpoint</p>
      </CardHeader>
      <CardContent>
        {checkInLogs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No check-ins recorded yet</p>
            <p className="text-xs mt-1">Activity will appear here as guests are verified at the checkpoint</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {checkInLogs.map((log) => {
              const guest = guestMap[log.guest_id];
              const cfg = STATUS_CONFIG["Accepted"];
              const Icon = cfg.icon;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {log.guest_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {guest && <CategoryBadge category={guest.category} />}
                      {guest?.seating_zone && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MapPin className="w-2.5 h-2.5" />
                          {guest.seating_zone}
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                        Checked In
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">
                      {log.created_date ? format(new Date(log.created_date), "HH:mm") : "—"}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60">
                      {log.created_date ? format(new Date(log.created_date), "MMM d") : ""}
                    </p>
                    {log.performed_by && (
                      <p className="text-[9px] text-muted-foreground/50 mt-0.5 truncate max-w-[80px]">
                        {log.performed_by}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}