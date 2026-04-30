import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "../shared/StatusBadge";

export default function DispatchReport({ invitations }) {
  const tiers = ["Tier 1 - Gold Foil", "Tier 2 - Wax Seal", "Tier 3 - Digital"];

  const rows = tiers.map((tier) => {
    const tierInvs = invitations.filter((i) => i.tier === tier);
    return {
      tier,
      total: tierInvs.length,
      pending: tierInvs.filter((i) => i.delivery_status === "Pending").length,
      outForDelivery: tierInvs.filter((i) => i.delivery_status === "Out for Delivery").length,
      delivered: tierInvs.filter((i) => i.delivery_status === "Delivered").length,
      returned: tierInvs.filter((i) => i.delivery_status === "Returned").length,
      failed: tierInvs.filter((i) => i.delivery_status === "Failed").length,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Dispatch Status Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold">Tier</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Total</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Pending</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">In Transit</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Delivered</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-center">Returned/Failed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.tier}>
                  <TableCell className="text-sm font-medium">{r.tier}</TableCell>
                  <TableCell className="text-center text-sm">{r.total}</TableCell>
                  <TableCell className="text-center text-sm">{r.pending}</TableCell>
                  <TableCell className="text-center text-sm text-amber-600 font-medium">{r.outForDelivery}</TableCell>
                  <TableCell className="text-center text-sm text-emerald-600 font-medium">{r.delivered}</TableCell>
                  <TableCell className="text-center text-sm text-red-600 font-medium">{r.returned + r.failed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}