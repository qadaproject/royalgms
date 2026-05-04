import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Wifi, UserCheck, Users } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";

export default function ArrivalTracker({ guests }) {
  const [pulse, setPulse] = useState(false);
  const [tab, setTab] = useState("arrived"); // "arrived" | "expected"

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 4000);
    return () => clearInterval(id);
  }, []);

  // "Arrived" = RSVP Accepted (set via Security Checkpoint check-in toggle)
  const arrived = guests
    .filter((g) => g.rsvp_status === "Accepted")
    .sort((a, b) => (b.updated_date || "").localeCompare(a.updated_date || ""));

  // "Expected" = Accepted RSVP but NOT yet checked in — here we treat
  // Pending guests who have an invitation (i.e. invited & not arrived yet)
  const expected = guests
    .filter((g) => g.rsvp_status === "Pending")
    .sort((a, b) => (a.category || "").localeCompare(b.category || ""));

  const total = guests.length;
  const arrivedPct = total ? Math.round((arrived.length / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <UserCheck className="w-4 h-4 text-accent" />
        <CardTitle className="font-heading text-lg flex-1">Arrival Tracker</CardTitle>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <Wifi className={`w-3.5 h-3.5 transition-opacity duration-1000 ${pulse ? "opacity-100" : "opacity-40"}`} />
          <span className="font-medium">Live</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{arrived.length}</p>
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider mt-0.5">Arrived</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{expected.length}</p>
            <p className="text-[10px] text-amber-600 uppercase tracking-wider mt-0.5">Expected</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{arrivedPct}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Check-in Rate</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${arrivedPct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{arrived.length} of {total} guests have checked in</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setTab("arrived")}
            className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === "arrived" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Arrived ({arrived.length})
          </button>
          <button
            onClick={() => setTab("expected")}
            className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === "expected" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Clock className="w-3.5 h-3.5" /> Expected ({expected.length})
          </button>
        </div>

        {/* Guest list */}
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {tab === "arrived" && arrived.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No check-ins recorded yet</p>
          )}
          {tab === "expected" && expected.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">All guests have arrived!</p>
          )}

          {(tab === "arrived" ? arrived : expected).map((g) => (
            <div
              key={g.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                tab === "arrived"
                  ? "bg-emerald-50/60 border-emerald-100"
                  : "bg-amber-50/40 border-amber-100"
              }`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${tab === "arrived" ? "bg-emerald-500" : "bg-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {g.formal_salutation ? `${g.formal_salutation} ` : ""}{g.full_name}
                </p>
                {g.official_title && (
                  <p className="text-[10px] text-muted-foreground truncate">{g.official_title}</p>
                )}
              </div>
              <CategoryBadge category={g.category} compact />
              {g.seating_zone && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">{g.seating_zone}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}