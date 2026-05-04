import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Crown } from "lucide-react";

const TIER_LABELS = {
  "Tier 1 - Gold Foil": "Tier 1 · Gold",
  "Tier 2 - Wax Seal": "Tier 2 · Wax",
  "Tier 3 - Digital": "Tier 3 · Digital",
};

const TIER_COLORS = {
  "Tier 1 - Gold Foil": "#c9a84c",
  "Tier 2 - Wax Seal": "#a78bfa",
  "Tier 3 - Digital": "#38bdf8",
};

const STATUS_COLORS = {
  Accepted: "#10b981",
  Pending: "#f59e0b",
  Declined: "#ef4444",
  Proxy: "#3b82f6",
};

export default function TierRSVPChart({ guests, invitations }) {
  // Build per-tier RSVP breakdown
  const tiers = ["Tier 1 - Gold Foil", "Tier 2 - Wax Seal", "Tier 3 - Digital"];
  
  const data = tiers.map((tier) => {
    const tierInvites = invitations.filter((inv) => inv.tier === tier);
    const tierGuestIds = new Set(tierInvites.map((inv) => inv.guest_id));
    const tierGuests = guests.filter((g) => tierGuestIds.has(g.id));

    return {
      tier: TIER_LABELS[tier] || tier,
      fullTier: tier,
      Accepted: tierGuests.filter((g) => g.rsvp_status === "Accepted").length,
      Pending: tierGuests.filter((g) => g.rsvp_status === "Pending").length,
      Declined: tierGuests.filter((g) => g.rsvp_status === "Declined").length,
      Proxy: tierGuests.filter((g) => g.rsvp_status === "Proxy").length,
      total: tierGuests.length,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-medium text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <Crown className="w-4 h-4 text-accent" />
        <CardTitle className="font-heading text-lg">RSVP Count by Invitation Tier</CardTitle>
        <div className="ml-auto flex gap-3">
          {tiers.map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_COLORS[t] }} />
              <span>{TIER_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.some((d) => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="tier" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Accepted" fill={STATUS_COLORS.Accepted} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pending" fill={STATUS_COLORS.Pending} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Declined" fill={STATUS_COLORS.Declined} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Proxy" fill={STATUS_COLORS.Proxy} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Crown className="w-8 h-8 opacity-30" />
            <p className="text-sm">No invitation data available</p>
          </div>
        )}

        {/* Tier summary pills */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {data.map((d) => (
            <div key={d.tier} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{d.tier}</p>
              <p className="text-2xl font-bold text-foreground">{d.Accepted}</p>
              <p className="text-[10px] text-muted-foreground">confirmed / {d.total} total</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}