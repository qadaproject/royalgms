import { base44 } from "@/api/base44Client";

let _cachedUser = null;

async function getPerformer() {
  if (_cachedUser) return _cachedUser;
  try {
    const me = await base44.auth.me();
    _cachedUser = me?.full_name || me?.email || "Admin";
  } catch {
    _cachedUser = "Admin";
  }
  return _cachedUser;
}

function seatLabel(zone, seat) {
  return [zone, seat].filter(Boolean).join(" · ") || "Unassigned";
}

export async function logSeatingChange({ guest, oldZone, newZone, oldSeat, newSeat }) {
  if (!guest?.id) return;
  const oldLabel = seatLabel(oldZone, oldSeat);
  const newLabel = seatLabel(newZone, newSeat);
  if (oldLabel === newLabel) return;

  const performedBy = await getPerformer();
  try {
    await base44.entities.GuestActivityLog.create({
      guest_id: guest.id,
      guest_name: guest.full_name,
      event_type: "zone_assigned",
      description: "Seat assignment changed",
      old_value: oldLabel,
      new_value: newLabel,
      performed_by: performedBy,
    });
  } catch {
    // never block the assignment on logging failure
  }
}