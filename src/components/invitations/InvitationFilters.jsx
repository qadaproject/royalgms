import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const tiers = ["All Tiers", "Tier 1 - Gold Foil", "Tier 2 - Wax Seal", "Tier 3 - Digital"];
const statuses = ["All Status", "Pending", "Out for Delivery", "Delivered", "Returned", "Failed"];

export default function InvitationFilters({ search, setSearch, tier, setTier, status, setStatus }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by guest name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Select value={tier} onValueChange={setTier}>
        <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}