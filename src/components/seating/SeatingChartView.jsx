import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, ChevronDown, ChevronUp } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";

const ZONE_COLORS = [
  { bg: "bg-amber-500/10 border-amber-500/30", header: "bg-amber-500/20", dot: "bg-amber-400" },
  { bg: "bg-purple-500/10 border-purple-500/30", header: "bg-purple-500/20", dot: "bg-purple-400" },
  { bg: "bg-sky-500/10 border-sky-500/30", header: "bg-sky-500/20", dot: "bg-sky-400" },
  { bg: "bg-emerald-500/10 border-emerald-500/30", header: "bg-emerald-500/20", dot: "bg-emerald-400" },
  { bg: "bg-rose-500/10 border-rose-500/30", header: "bg-rose-500/20", dot: "bg-rose-400" },
  { bg: "bg-indigo-500/10 border-indigo-500/30", header: "bg-indigo-500/20", dot: "bg-indigo-400" },
];

function SeatDot({ filled, label }) {
  return (
    <div
      title={label || (filled ? "Occupied" : "Empty")}
      className={`w-6 h-6 rounded-full border transition-all cursor-default ${
        filled
          ? "bg-accent border-accent/80 shadow-sm shadow-accent/30"
          : "bg-muted/30 border-border border-dashed"
      }`}
    />
  );
}

export default function SeatingChartView({ zones, guests }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {zones.map((zone, idx) => {
        const color = ZONE_COLORS[idx % ZONE_COLORS.length];
        const assigned = guests.filter(
          (g) => g.seating_zone === zone.name && g.rsvp_status === "Accepted"
        );
        const capacity = zone.capacity || 0;
        const occupancy = Math.min(assigned.length, capacity);
        const empty = Math.max(0, capacity - occupancy);
        const pct = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
        const isExpanded = !!expanded[zone.id];

        // Build seat grid (max 40 dots shown)
        const seatSlots = Math.min(capacity, 40);
        const seats = Array.from({ length: seatSlots }, (_, i) => ({
          filled: i < occupancy,
          guest: assigned[i] || null,
        }));

        return (
          <div key={zone.id} className={`border rounded-xl overflow-hidden ${color.bg}`}>
            {/* Zone header */}
            <div className={`px-4 py-3 ${color.header} flex items-center gap-2`}>
              <MapPin className="w-4 h-4 text-foreground/70 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{zone.name}</p>
                {zone.description && (
                  <p className="text-[10px] text-muted-foreground truncate">{zone.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{occupancy}/{capacity}</span>
              </div>
            </div>

            <div className="p-4">
              {/* Capacity bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{pct}% occupied</span>
                  <span className={empty === 0 ? "text-red-400 font-medium" : "text-emerald-500 font-medium"}>
                    {empty} seats free
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Seat dots */}
              {seatSlots > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {seats.map((s, i) => (
                    <SeatDot
                      key={i}
                      filled={s.filled}
                      label={s.guest?.full_name}
                    />
                  ))}
                  {capacity > 40 && (
                    <span className="text-[10px] text-muted-foreground self-center">+{capacity - 40} more</span>
                  )}
                </div>
              )}

              {/* Toggle guest list */}
              {assigned.length > 0 && (
                <button
                  onClick={() => toggle(zone.id)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full"
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {isExpanded ? "Hide" : "Show"} {assigned.length} confirmed guest{assigned.length !== 1 ? "s" : ""}
                </button>
              )}

              {isExpanded && assigned.length > 0 && (
                <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {assigned.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 py-1 border-b border-border/40 last:border-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {g.formal_salutation} {g.full_name}
                        </p>
                        {g.official_title && (
                          <p className="text-[10px] text-muted-foreground truncate">{g.official_title}</p>
                        )}
                      </div>
                      <CategoryBadge category={g.category} compact />
                    </div>
                  ))}
                </div>
              )}

              {assigned.length === 0 && (
                <p className="text-[11px] text-muted-foreground italic mt-1">No confirmed guests assigned</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}