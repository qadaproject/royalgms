import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Wifi } from "lucide-react";

export default function ZoneCapacityLive({ zones, guests }) {
  const [pulse, setPulse] = useState(false);

  // Pulse the indicator every 5 seconds to signal live
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 5000);
    return () => clearInterval(id);
  }, []);

  // Build per-zone check-in stats (Accepted = checked in for live view)
  const zoneStats = zones.map((z) => {
    const assigned = guests.filter((g) => g.seating_zone === z.name);
    const checkedIn = assigned.filter((g) => g.rsvp_status === "Accepted").length;
    const capacity = z.capacity || 0;
    const pct = capacity ? Math.min(100, Math.round((checkedIn / capacity) * 100)) : 0;

    let statusColor = "bg-emerald-500";
    let textColor = "text-emerald-700";
    if (pct >= 90) { statusColor = "bg-destructive"; textColor = "text-destructive"; }
    else if (pct >= 70) { statusColor = "bg-amber-500"; textColor = "text-amber-700"; }

    return { ...z, checkedIn, capacity, pct, statusColor, textColor };
  });

  const totalCheckedIn = zoneStats.reduce((s, z) => s + z.checkedIn, 0);
  const totalCapacity = zoneStats.reduce((s, z) => s + z.capacity, 0);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <MapPin className="w-4 h-4 text-accent" />
        <CardTitle className="font-heading text-lg flex-1">Live Venue Capacity</CardTitle>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <Wifi className={`w-3.5 h-3.5 transition-opacity duration-1000 ${pulse ? "opacity-100" : "opacity-40"}`} />
          <span className="font-medium">Live</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalCheckedIn}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Total Confirmed</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalCapacity}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Total Capacity</p>
          </div>
        </div>

        {/* Per-zone rows */}
        {zoneStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No zones configured</p>
        ) : (
          zoneStats.map((z) => (
            <div key={z.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground truncate max-w-[60%]">{z.name}</span>
                <span className={`text-xs font-semibold ${z.textColor}`}>
                  {z.checkedIn} / {z.capacity}
                  <span className="text-muted-foreground font-normal ml-1">({z.pct}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${z.statusColor}`}
                  style={{ width: `${z.pct}%` }}
                />
              </div>
            </div>
          ))
        )}

        <p className="text-[10px] text-muted-foreground pt-1">
          Confirmed RSVPs counted per zone. Refreshes automatically with guest data.
        </p>
      </CardContent>
    </Card>
  );
}