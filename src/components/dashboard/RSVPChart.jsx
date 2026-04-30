import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = {
  Accepted: "#10b981",
  Pending: "#f59e0b",
  Declined: "#ef4444",
  Proxy: "#3b82f6",
};

export default function DashboardRSVPChart({ guests }) {
  const data = Object.entries(
    guests.reduce((acc, g) => {
      const status = g.rsvp_status || "Pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">RSVP Status</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
            No guest data yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}