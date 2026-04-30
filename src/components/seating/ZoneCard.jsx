import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pencil, UserPlus, Users, ShieldCheck } from "lucide-react";

export default function ZoneCard({ zone, assignedGuests, onEdit, onAssign }) {
  const occupancy = zone.capacity > 0 ? Math.round((assignedGuests.length / zone.capacity) * 100) : 0;
  const isNearCapacity = occupancy >= 80;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 -translate-y-8 translate-x-8 bg-accent/5 rounded-full" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-heading text-lg">{zone.name}</CardTitle>
            {zone.description && (
              <p className="text-xs text-muted-foreground mt-1">{zone.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capacity Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {assignedGuests.length} / {zone.capacity}
            </span>
            <span className={`font-medium ${isNearCapacity ? "text-destructive" : "text-muted-foreground"}`}>
              {occupancy}%
            </span>
          </div>
          <Progress value={occupancy} className="h-1.5" />
        </div>

        {/* Allowed Categories */}
        {zone.categories_allowed?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {zone.categories_allowed.map((cat) => (
              <Badge key={cat} variant="outline" className="text-[9px] px-1.5 py-0">
                {cat}
              </Badge>
            ))}
          </div>
        )}

        {/* Assigned Guests Preview */}
        {assignedGuests.length > 0 && (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {assignedGuests.slice(0, 5).map((g) => (
              <div key={g.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/30 last:border-0">
                <span className="truncate flex-1">{g.full_name}</span>
                {g.special_requirements && (
                  <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                )}
              </div>
            ))}
            {assignedGuests.length > 5 && (
              <p className="text-[10px] text-muted-foreground">+{assignedGuests.length - 5} more</p>
            )}
          </div>
        )}

        {/* Special Notes */}
        {zone.special_notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <p className="text-[10px] text-amber-800">{zone.special_notes}</p>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" onClick={onAssign}>
          <UserPlus className="w-3.5 h-3.5 mr-2" />
          Assign Guest
        </Button>
      </CardContent>
    </Card>
  );
}