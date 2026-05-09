import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, CheckCircle2 } from "lucide-react";

export default function ZoneOccupancySummary({ zones, guests }) {
  if (!zones.length) return null;

  const zoneStats = zones.map((zone) => {
    const assigned = guests.filter((g) => g.seating_zone === zone.name).length;
    const confirmed = guests.filter((g) => g.seating_zone === zone.name && g.rsvp_status === "Accepted").length;
    const pct = zone.capacity > 0 ? Math.min(Math.round((assigned / zone.capacity) * 100), 100) : 0;
    const available = Math.max(zone.capacity - assigned, 0);
    return { zone, assigned, confirmed, pct, available };
  }).sort((a, b) => b.pct - a.pct);

  const totalCapacity = zones.reduce((s, z) => s + (z.capacity || 0), 0);
  const totalAssigned = guests.filter((g) => g.seating_zone).length;
  const totalPct = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          Zone Occupancy Overview
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {totalAssigned}/{totalCapacity} total seats filled ({totalPct}%)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {zoneStats.map(({ zone, assigned, confirmed, pct, available }) => {
            const color = pct >= 90 ? "text-destructive" : pct >= 70 ? "text-amber-600" : "text-emerald-600";
            const progressColor = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div key={zone.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate">{zone.name}</p>
                  <span className={`text-xs font-bold ${color}`}>{pct}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" /> {assigned}/{zone.capacity} assigned
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> {confirmed} confirmed
                  </span>
                  <span className={available === 0 ? "text-destructive font-semibold" : ""}>
                    {available} free
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}