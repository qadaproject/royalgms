import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const categories = ["A - Royal", "B - Federal", "C - State", "D - Corporate", "E - Diplomatic", "F - Traditional", "G - General"];

export default function RSVPSummaryReport({ guests }) {
  const rows = categories.map((cat) => {
    const catGuests = guests.filter((g) => g.category === cat);
    return {
      category: cat,
      total: catGuests.length,
      accepted: catGuests.filter((g) => g.rsvp_status === "Accepted").length,
      pending: catGuests.filter((g) => g.rsvp_status === "Pending").length,
      declined: catGuests.filter((g) => g.rsvp_status === "Declined").length,
      proxy: catGuests.filter((g) => g.rsvp_status === "Proxy").length,
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      accepted: acc.accepted + r.accepted,
      pending: acc.pending + r.pending,
      declined: acc.declined + r.declined,
      proxy: acc.proxy + r.proxy,
    }),
    { total: 0, accepted: 0, pending: 0, declined: 0, proxy: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Daily RSVP Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Category</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Total</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Accepted</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Pending</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Declined</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Proxy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.category}>
                  <TableCell className="text-sm font-medium">{r.category}</TableCell>
                  <TableCell className="text-center text-sm">{r.total}</TableCell>
                  <TableCell className="text-center text-sm text-emerald-600 font-medium">{r.accepted}</TableCell>
                  <TableCell className="text-center text-sm text-amber-600 font-medium">{r.pending}</TableCell>
                  <TableCell className="text-center text-sm text-red-600 font-medium">{r.declined}</TableCell>
                  <TableCell className="text-center text-sm text-blue-600 font-medium">{r.proxy}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell className="text-sm">Total</TableCell>
                <TableCell className="text-center text-sm">{totals.total}</TableCell>
                <TableCell className="text-center text-sm text-emerald-600">{totals.accepted}</TableCell>
                <TableCell className="text-center text-sm text-amber-600">{totals.pending}</TableCell>
                <TableCell className="text-center text-sm text-red-600">{totals.declined}</TableCell>
                <TableCell className="text-center text-sm text-blue-600">{totals.proxy}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}