import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { MapPin, History } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SeatingChangeHistory() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["seatingHistory"],
    queryFn: () =>
      base44.entities.GuestActivityLog.filter(
        { event_type: "zone_assigned" },
        "-created_date",
        30
      ),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          Assignment Change History
          <span className="text-[10px] text-muted-foreground font-normal ml-1">last 30</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No seat changes recorded yet
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-xs border-b border-border last:border-0 pb-2 last:pb-0"
              >
                <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {log.guest_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {log.old_value && (
                      <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground line-through">
                        {log.old_value}
                      </span>
                    )}
                    {log.old_value && log.new_value && (
                      <span className="text-muted-foreground">→</span>
                    )}
                    {log.new_value && (
                      <span className="bg-accent/15 text-accent px-1.5 py-0.5 rounded font-medium">
                        {log.new_value}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {log.created_date
                      ? format(new Date(log.created_date), "MMM d, yyyy · h:mm a")
                      : ""}
                    {log.performed_by && ` · by ${log.performed_by}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}