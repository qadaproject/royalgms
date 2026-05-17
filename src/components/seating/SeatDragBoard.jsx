import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, MapPin, Users, Search, ShieldCheck } from "lucide-react";
import CategoryBadge from "../shared/CategoryBadge";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Build table groups: each zone has numbered tables (capacity / TABLE_SIZE seats each)
const TABLE_SIZE = 8;

function getTablesForZone(zone, assignedGuests) {
  const numTables = Math.max(1, Math.ceil(zone.capacity / TABLE_SIZE));
  const tables = Array.from({ length: numTables }, (_, i) => ({
    id: `${zone.id}::table-${i + 1}`,
    label: `Table ${i + 1}`,
    seats: TABLE_SIZE,
    guests: [],
  }));

  assignedGuests.forEach((g) => {
    // seat_number is stored as "TableX-SeatY" or just table index
    const match = g.seat_number?.match(/^Table(\d+)-/);
    const tIdx = match ? parseInt(match[1]) - 1 : 0;
    const safeIdx = Math.min(tIdx, tables.length - 1);
    tables[safeIdx].guests.push(g);
  });

  return tables;
}

export default function SeatDragBoard({ zones, guests, onUpdate }) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Unassigned accepted guests
  const unassigned = guests.filter(
    (g) => g.rsvp_status === "Accepted" && !g.seating_zone && !g.seat_number
  ).filter((g) =>
    !search || g.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Build zone/table structure
  const zoneBoards = zones.map((zone) => {
    const zoneGuests = guests.filter(
      (g) => g.seating_zone === zone.name && g.rsvp_status === "Accepted"
    );
    return { zone, tables: getTablesForZone(zone, zoneGuests) };
  });

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const guestId = draggableId;
    const destParts = destination.droppableId.split("::");

    if (destination.droppableId === "unassigned") {
      // Remove zone + seat
      await base44.entities.Guest.update(guestId, { seating_zone: "", seat_number: "" });
    } else if (destParts.length === 2) {
      // zone.id::table-N
      const zoneId = destParts[0];
      const tableLabel = destParts[1]; // "table-N"
      const tableNum = tableLabel.replace("table-", "");
      const targetZone = zones.find((z) => z.id === zoneId);
      if (!targetZone) return;

      await base44.entities.Guest.update(guestId, {
        seating_zone: targetZone.name,
        seat_number: `Table${tableNum}-Seat${destination.index + 1}`,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["guests"] });
    toast.success("Seating updated");
    if (onUpdate) onUpdate();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Unassigned pool */}
        <Card className="border-dashed border-2 border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Unassigned Guests
              <Badge variant="secondary" className="ml-auto">{unassigned.length}</Badge>
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter guests..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Droppable droppableId="unassigned" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-wrap gap-2 min-h-[60px] p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? "bg-accent/10 border border-accent/30" : "bg-muted/30"}`}
                >
                  {unassigned.length === 0 && !snapshot.isDraggingOver && (
                    <p className="text-xs text-muted-foreground m-auto">All accepted guests are assigned</p>
                  )}
                  {unassigned.map((g, i) => (
                    <Draggable key={g.id} draggableId={g.id} index={i}>
                      {(drag, dragSnap) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          className={`flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5 text-xs cursor-grab shadow-sm ${dragSnap.isDragging ? "shadow-lg ring-2 ring-accent/40 rotate-1" : ""}`}
                        >
                          <GripVertical className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium truncate max-w-[120px]">{g.full_name}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>

        {/* Zone boards */}
        {zoneBoards.map(({ zone, tables }) => (
          <Card key={zone.id}>
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                {zone.name}
                <Badge className="ml-auto bg-accent/20 text-accent-foreground border-accent/30 text-[10px]">
                  {tables.reduce((a, t) => a + t.guests.length, 0)} / {zone.capacity}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tables.map((table) => {
                  const isFull = table.guests.length >= table.seats;
                  return (
                    <div key={table.id} className="border border-border rounded-lg overflow-hidden">
                      <div className={`px-3 py-1.5 flex items-center justify-between text-xs font-semibold ${isFull ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-foreground"}`}>
                        <span>{table.label}</span>
                        <span className={isFull ? "text-destructive" : "text-muted-foreground"}>
                          {table.guests.length}/{table.seats}
                        </span>
                      </div>
                      <Droppable droppableId={table.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[80px] p-2 space-y-1 transition-colors ${snapshot.isDraggingOver ? "bg-accent/10" : ""}`}
                          >
                            {table.guests.map((g, i) => (
                              <Draggable key={g.id} draggableId={g.id} index={i}>
                                {(drag, dragSnap) => (
                                  <div
                                    ref={drag.innerRef}
                                    {...drag.draggableProps}
                                    {...drag.dragHandleProps}
                                    className={`flex items-center gap-1.5 bg-background border border-border rounded px-2 py-1 text-[11px] cursor-grab ${dragSnap.isDragging ? "shadow-lg ring-1 ring-accent/40" : ""}`}
                                  >
                                    <GripVertical className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                    <span className="font-medium truncate flex-1">{g.full_name}</span>
                                    {g.special_requirements && (
                                      <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                                    )}
                                    <span className="text-[9px] text-muted-foreground">{g.seat_number?.split("-")?.[1] || ""}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {table.guests.length === 0 && !snapshot.isDraggingOver && (
                              <p className="text-[10px] text-muted-foreground text-center pt-3">Drop guest here</p>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
}