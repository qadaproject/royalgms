import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";
import { differenceInDays } from "date-fns";

export default function NoShowAlerts({ guests, invitations }) {
  // Find Tier 1 VIPs who haven't responded within 14 days
  const deliveredMap = {};
  invitations.forEach((inv) => {
    if (inv.delivery_status === "Delivered" && inv.delivered_date) {
      deliveredMap[inv.guest_id] = inv.delivered_date;
    }
  });

  const atRisk = guests.filter((g) => {
    if (g.rsvp_status !== "Pending") return false;
    if (!["A - Royal", "B - Federal"].includes(g.category)) return false;
    const deliveredDate = deliveredMap[g.id];
    if (!deliveredDate) return false;
    return differenceInDays(new Date(), new Date(deliveredDate)) >= 14;
  });

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <CardTitle className="font-heading text-lg">No-Show Risk Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {atRisk.length > 0 ? (
          <div className="space-y-3">
            {atRisk.map((guest) => (
              <div key={guest.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {guest.formal_salutation} {guest.full_name}
                  </p>
                  <CategoryBadge category={guest.category} />
                </div>
                <span className="text-[10px] text-destructive font-medium shrink-0">
                  14+ days
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No at-risk VIPs at this time
          </p>
        )}
      </CardContent>
    </Card>
  );
}