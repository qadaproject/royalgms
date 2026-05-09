import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Crown, CheckCircle2, Clock, XCircle } from "lucide-react";

const CATEGORIES = [
  "A - Royal",
  "B - Federal",
  "C - State",
  "D - Corporate",
  "E - Diplomatic",
  "F - Traditional",
  "G - General",
];

const SHORT_LABEL = {
  "A - Royal": "Royal",
  "B - Federal": "Federal",
  "C - State": "State",
  "D - Corporate": "Corporate",
  "E - Diplomatic": "Diplomatic",
  "F - Traditional": "Traditional",
  "G - General": "General",
};

export default function CategoryRSVPWidget({ guests }) {
  const rows = CATEGORIES.map((cat) => {
    const catGuests = guests.filter((g) => g.category === cat);
    if (catGuests.length === 0) return null;
    const invited = catGuests.length;
    const confirmed = catGuests.filter((g) => g.rsvp_status === "Accepted").length;
    const pending = catGuests.filter((g) => g.rsvp_status === "Pending").length;
    const declined = catGuests.filter((g) => g.rsvp_status === "Declined").length;
    const pct = invited > 0 ? Math.round((confirmed / invited) * 100) : 0;
    return { cat, invited, confirmed, pending, declined, pct };
  }).filter(Boolean);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <Crown className="w-4 h-4 text-accent" />
          Invited vs Confirmed by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {rows.map(({ cat, invited, confirmed, pending, declined, pct }) => (
            <div key={cat} className="flex items-center gap-3 px-6 py-3">
              <div className="w-24 shrink-0">
                <p className="text-xs font-semibold text-foreground">{SHORT_LABEL[cat]}</p>
                <p className="text-[10px] text-muted-foreground">{invited} invited</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] shrink-0">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> {confirmed}
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Clock className="w-3 h-3" /> {pending}
                </span>
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="w-3 h-3" /> {declined}
                </span>
                <span className="text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            </div>
          ))}
        </div>
        {rows.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No guest data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}