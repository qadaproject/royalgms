import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ProductPerformanceChart({ products }) {
  if (!products || products.length === 0) return null;

  const data = products.map(p => ({
    name: p.name.length > 16 ? p.name.slice(0, 14) + "…" : p.name,
    Views: p.view_count || 0,
    Favourites: p.favourite_count || 0,
    Comments: p.comment_count || 0,
    Shares: p.share_count || 0,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-8">
      <h3 className="font-heading text-base font-semibold mb-1">Product Performance</h3>
      <p className="text-xs text-muted-foreground mb-4">Side-by-side comparison of views and engagement per listing</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Views" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Favourites" fill="#f87171" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Comments" fill="#60a5fa" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Shares" fill="#34d399" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}