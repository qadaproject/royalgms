import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, MapPin, UserX } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import CategoryBadge from "../shared/CategoryBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SeatingWaitlist({ guests, zones }) {
  const [search, setSearch] = useState("");
  const [assigningGuest, setAssigningGuest] = useState(null);
  const queryClient = useQueryClient();

  // Unassigned guests who have accepted
  const unassigned = guests.filter(
    (g) => !g.seating_zone && g.rsvp_status === "Accepted"
  );

  const filtered = unassigned.filter((g) =>
    g.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.official_title?.toLowerCase().includes(search.toLowerCase())
  );

  const assignMutation = useMutation({
    mutationFn: ({ guestId, zoneName }) =>
      base44.entities.Guest.update(guestId, { seating_zone: zoneName }),
    onSuccess: (_, { zoneName }) => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success(`Guest assigned to ${zoneName}`);
      setAssigningGuest(null);
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <UserX className="w-4 h-4 text-amber-500" />
        <CardTitle className="font-heading text-lg flex-1">
          Waitlist — Unassigned Guests
        </CardTitle>
        <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5">
          {unassigned.length} guests
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {unassigned.length === 0
                ? "All accepted guests have been assigned to zones"
                : "No guests match your search"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {g.formal_salutation} {g.full_name}
                  </p>
                  <CategoryBadge category={g.category} compact />
                </div>

                {assigningGuest === g.id ? (
                  <Select
                    onValueChange={(zone) =>
                      assignMutation.mutate({ guestId: g.id, zoneName: zone })
                    }
                  >
                    <SelectTrigger className="h-7 w-40 text-xs">
                      <SelectValue placeholder="Pick zone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => {
                        const occupied = guests.filter(
                          (gg) => gg.seating_zone === z.name
                        ).length;
                        const available = z.capacity - occupied;
                        return (
                          <SelectItem
                            key={z.id}
                            value={z.name}
                            disabled={available <= 0}
                          >
                            {z.name}{" "}
                            <span className="text-muted-foreground">
                              ({available} free)
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0"
                    onClick={() => setAssigningGuest(g.id)}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    Assign
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground pt-1">
          Showing accepted guests with no zone assignment.
        </p>
      </CardContent>
    </Card>
  );
}