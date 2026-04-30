import { Badge } from "@/components/ui/badge";

const rsvpStyles = {
  Pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Accepted: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Declined: "bg-red-500/10 text-red-700 border-red-500/20",
  Proxy: "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

const deliveryStyles = {
  Pending: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  "Out for Delivery": "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Returned: "bg-red-500/10 text-red-700 border-red-500/20",
  Failed: "bg-red-500/10 text-red-700 border-red-500/20",
};

export default function StatusBadge({ status, type = "rsvp" }) {
  const styles = type === "rsvp" ? rsvpStyles : deliveryStyles;
  return (
    <Badge variant="outline" className={`text-[10px] font-medium uppercase tracking-wider border ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </Badge>
  );
}