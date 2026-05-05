import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Users, AlertTriangle } from "lucide-react";

const ZONE_COLORS = [
  { base: "#7a1c2e", light: "#fdf0f2" },
  { base: "#1a3a6b", light: "#f0f3f9" },
  { base: "#1a5c3a", light: "#f0f7f3" },
  { base: "#4a3000", light: "#faf6ee" },
  { base: "#4a1a6b", light: "#f5f0f9" },
  { base: "#6b3a00", light: "#fdf5ee" },
  { base: "#2a4a4a", light: "#f0f7f7" },
  { base: "#5a2a00", light: "#fdf5ee" },
];

export default function FloorPlanView({ zones, guests }) {
  const [hovered, setHovered] = useState(null);

  const zoneData = zones.map((z, i) => {
    const assigned = guests.filter((g) => g.seating_zone === z.name).length;
    const checkedIn = guests.filter((g) => g.seating_zone === z.name && g.rsvp_status === "Accepted").length;
    const capacity = z.capacity || 1;
    const pct = Math.min(100, Math.round((assigned / capacity) * 100));
    const isOver = assigned > capacity;
    const color = ZONE_COLORS[i % ZONE_COLORS.length];

    let fillColor = color.base + "33"; // 20% opacity default
    if (isOver) fillColor = "#dc262633";
    else if (pct >= 90) fillColor = "#f97316" + "44";
    else if (pct >= 70) fillColor = "#f59e0b" + "44";
    else if (pct >= 30) fillColor = color.base + "33";
    else fillColor = color.base + "18";

    let borderColor = color.base;
    if (isOver) borderColor = "#dc2626";
    else if (pct >= 90) borderColor = "#ea580c";
    else if (pct >= 70) borderColor = "#d97706";

    return { ...z, assigned, checkedIn, capacity, pct, isOver, color, fillColor, borderColor };
  });

  // Layout: place zones in a responsive grid for a floor plan feel
  const cols = Math.min(4, Math.ceil(Math.sqrt(zones.length)));

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-500" /> Under 70%</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-200 border border-amber-500" /> 70–90%</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-orange-200 border border-orange-500" /> 90–100%</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-200 border border-red-500" /> Over Capacity</div>
      </div>

      {/* Floor grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {zoneData.map((z) => (
          <div
            key={z.id}
            className="relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: hovered === z.id
                ? z.isOver ? "#dc262622" : z.pct >= 90 ? "#f9731622" : z.pct >= 70 ? "#f59e0b22" : z.color.base + "22"
                : z.fillColor,
              borderColor: z.borderColor,
              minHeight: 130,
            }}
            onMouseEnter={() => setHovered(z.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Over capacity warning */}
            {z.isOver && (
              <div className="absolute top-2 right-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            )}

            <p className="text-xs font-bold uppercase tracking-wider truncate mb-1" style={{ color: z.borderColor }}>
              {z.name}
            </p>

            {/* Capacity bar */}
            <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, z.pct)}%`,
                  backgroundColor: z.isOver ? "#dc2626" : z.pct >= 90 ? "#ea580c" : z.pct >= 70 ? "#d97706" : z.borderColor,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs" style={{ color: z.borderColor }}>
                <Users className="w-3 h-3" />
                <span className="font-semibold">{z.assigned}</span>
                <span className="opacity-60">/ {z.capacity}</span>
              </div>
              <span className="text-[10px] font-bold" style={{ color: z.borderColor }}>{z.pct}%</span>
            </div>

            <div className="mt-2 text-[10px] text-black/50">
              {z.checkedIn} checked in
            </div>

            {/* Seat dots visual */}
            <div className="flex flex-wrap gap-0.5 mt-2">
              {Array.from({ length: Math.min(z.capacity, 20) }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: i < z.checkedIn
                      ? z.borderColor
                      : i < z.assigned
                      ? z.borderColor + "66"
                      : "#00000015",
                  }}
                />
              ))}
              {z.capacity > 20 && <span className="text-[9px] text-black/30 ml-0.5">+{z.capacity - 20}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel on hover */}
      {hovered && (() => {
        const z = zoneData.find((x) => x.id === hovered);
        if (!z) return null;
        const zGuests = guests.filter((g) => g.seating_zone === z.name);
        return (
          <Card className="border-2" style={{ borderColor: z.borderColor + "66" }}>
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-base" style={{ color: z.borderColor }}>{z.name} — Guest List</CardTitle>
            </CardHeader>
            <CardContent>
              {zGuests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No guests assigned</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {zGuests.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${g.rsvp_status === "Accepted" ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <span className="truncate text-foreground font-medium">{g.formal_salutation} {g.full_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}