import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Send, UserPlus, Clock } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";
import { format } from "date-fns";

export default function RecentActivity({ guests, invitations }) {
  // Combine and sort recent items
  const recentGuests = guests.slice(0, 5).map((g) => ({
    type: g.rsvp_status === "Accepted" ? "rsvp" : "added",
    name: g.full_name,
    category: g.category,
    date: g.updated_date || g.created_date,
    status: g.rsvp_status,
  }));

  const recentInvitations = invitations.slice(0, 5).map((i) => ({
    type: "dispatch",
    name: i.guest_name,
    category: i.guest_category,
    date: i.updated_date || i.created_date,
    status: i.delivery_status,
  }));

  const items = [...recentGuests, ...recentInvitations]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const iconMap = {
    rsvp: CheckCircle2,
    added: UserPlus,
    dispatch: Send,
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, i) => {
              const Icon = iconMap[item.type] || Clock;
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={item.category} />
                      <span className="text-[10px] text-muted-foreground">{item.status}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {item.date ? format(new Date(item.date), "MMM d") : ""}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
}