import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";
import { differenceInDays, format } from "date-fns";

export default function VIPAlertReport({ guests, invitations }) {
  const deliveredMap = {};
  invitations.forEach((inv) => {
    if (inv.delivery_status === "Delivered" && inv.delivered_date) {
      deliveredMap[inv.guest_id] = inv;
    }
  });

  const vipPending = guests.filter((g) => {
    if (g.rsvp_status !== "Pending") return false;
    if (!["A - Royal", "B - Federal"].includes(g.category)) return false;
    return true;
  });

  const atRisk = vipPending.filter((g) => {
    const inv = deliveredMap[g.id];
    if (!inv) return false;
    return differenceInDays(new Date(), new Date(inv.delivered_date)) >= 14;
  });

  const recentlyDelivered = vipPending.filter((g) => {
    const inv = deliveredMap[g.id];
    if (!inv) return false;
    return differenceInDays(new Date(), new Date(inv.delivered_date)) < 14;
  });

  const notDelivered = vipPending.filter((g) => !deliveredMap[g.id]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <CardTitle className="font-heading text-lg">VIP Response Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* At Risk */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-3">
            At Risk — No Response 14+ Days ({atRisk.length})
          </h3>
          {atRisk.length > 0 ? (
            <div className="space-y-2">
              {atRisk.map((g) => {
                const inv = deliveredMap[g.id];
                const days = differenceInDays(new Date(), new Date(inv.delivered_date));
                return (
                  <div key={g.id} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{g.formal_salutation} {g.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge category={g.category} />
                        <span className="text-[10px] text-muted-foreground">
                          Delivered {format(new Date(inv.delivered_date), "MMM d")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-destructive">{days}d</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No at-risk VIPs</p>
          )}
        </div>

        {/* Recently delivered, awaiting response */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-3">
            Awaiting Response ({recentlyDelivered.length})
          </h3>
          {recentlyDelivered.length > 0 ? (
            <div className="space-y-2">
              {recentlyDelivered.map((g) => {
                const inv = deliveredMap[g.id];
                const days = differenceInDays(new Date(), new Date(inv.delivered_date));
                return (
                  <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{g.full_name}</p>
                      <CategoryBadge category={g.category} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{days}d ago</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None</p>
          )}
        </div>

        {/* Not yet delivered */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Not Yet Delivered ({notDelivered.length})
          </h3>
          {notDelivered.length > 0 ? (
            <div className="space-y-2">
              {notDelivered.map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{g.full_name}</p>
                    <CategoryBadge category={g.category} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All VIP invitations dispatched</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}