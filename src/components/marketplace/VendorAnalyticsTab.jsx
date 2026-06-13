import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, Heart, Share2, MessageSquare, TrendingUp, Users } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

export default function VendorAnalyticsTab({ vendor, products }) {
  // Fetch all interactions for this vendor to build weekly chart
  const { data: interactions = [] } = useQuery({
    queryKey: ["vendor_interactions_analytics", vendor.id],
    queryFn: () => base44.entities.VendorProductInteraction.filter({ vendor_id: vendor.id }),
    enabled: !!vendor.id,
  });

  const totalViews = products.reduce((a, p) => a + (p.view_count || 0), 0);
  const totalFavs = products.reduce((a, p) => a + (p.favourite_count || 0), 0);
  const totalShares = products.reduce((a, p) => a + (p.share_count || 0), 0);
  const totalComments = products.reduce((a, p) => a + (p.comment_count || 0), 0);
  const profileViews = vendor.profile_view_count || 0;

  // Build last 7 days chart data from interactions
  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = startOfDay(subDays(new Date(), 6 - i));
      return {
        day: format(d, "EEE"),
        date: d,
        views: 0,
        favourites: 0,
        shares: 0,
        comments: 0,
      };
    });

    interactions.forEach(interaction => {
      const d = startOfDay(new Date(interaction.created_date));
      const slot = days.find(s => s.date.getTime() === d.getTime());
      if (!slot) return;
      if (interaction.type === "view") slot.views++;
      else if (interaction.type === "favourite") slot.favourites++;
      else if (interaction.type === "share") slot.shares++;
      else if (interaction.type === "comment") slot.comments++;
    });

    return days.map(({ day, views, favourites, shares, comments }) => ({ day, views, favourites, shares, comments }));
  }, [interactions]);

  const statCards = [
    { label: "Profile Visits", value: profileViews, icon: <Users className="w-5 h-5 text-indigo-500" />, color: "text-indigo-600" },
    { label: "Total Views", value: totalViews, icon: <Eye className="w-5 h-5 text-blue-500" />, color: "text-blue-600" },
    { label: "Favourites", value: totalFavs, icon: <Heart className="w-5 h-5 text-red-400" />, color: "text-red-600" },
    { label: "Shares", value: totalShares, icon: <Share2 className="w-5 h-5 text-green-500" />, color: "text-green-600" },
    { label: "Comments", value: totalComments, icon: <MessageSquare className="w-5 h-5 text-purple-500" />, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">{s.icon}</div>
            <p className={`font-heading text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-base font-semibold">Last 7 Days Activity</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="favourites" name="Favourites" fill="#f87171" radius={[3, 3, 0, 0]} />
            <Bar dataKey="shares" name="Shares" fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar dataKey="comments" name="Comments" fill="#a855f7" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-product breakdown */}
      {products.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading text-base font-semibold mb-4">Per-Product Stats</h3>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="border border-border rounded-lg p-3">
                <p className="text-sm font-medium mb-2 truncate">{p.name}</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Views", value: p.view_count || 0, color: "text-blue-600" },
                    { label: "Favs", value: p.favourite_count || 0, color: "text-red-500" },
                    { label: "Shares", value: p.share_count || 0, color: "text-green-600" },
                    { label: "Comments", value: p.comment_count || 0, color: "text-purple-600" },
                  ].map(m => (
                    <div key={m.label}>
                      <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}