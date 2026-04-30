import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function DashboardCategoryBreakdown({ guests }) {
  const data = ["A", "B", "C", "D", "E", "F", "G"].map((letter) => {
    const cat = guests.filter((g) => g.category?.startsWith(letter));
    return {
      name: letter,
      total: cat.length,
      accepted: cat.filter((g) => g.rsvp_status === "Accepted").length,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {guests.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barGap={4}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(222 47% 14%)" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="accepted" fill="hsl(43 72% 55%)" radius={[4, 4, 0, 0]} name="Accepted" />
            </BarChart>
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