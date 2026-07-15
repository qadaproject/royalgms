import { base44 } from "@/api/base44Client";

/**
 * Logs a guest's access to an invitation or itinerary link.
 * @param {object} guest - The guest record
 * @param {string} page - "Invitation" | "Itinerary"
 * @param {string} source - origin channel e.g. "Email", "SMS", "WhatsApp", "Direct"
 */
export function logLinkAccess(guest, page, source) {
  if (!guest?.id) return Promise.resolve();
  const src = source || "Direct";
  return base44.entities.GuestActivityLog.create({
    guest_id: guest.id,
    guest_name: guest.full_name,
    event_type: "link_accessed",
    description: `Guest opened ${page} link via ${src}`,
    source: src,
    page: page,
    performed_by: "Guest Portal",
  }).catch(() => {});
}

/**
 * Extracts the admission token and source from the URL query string.
 * Handles the case where a channel (e.g. WhatsApp) may have encoded the
 * source into the ref value as "CODE&source=channel".
 */
export function parseRefAndSource() {
  const urlParams = new URLSearchParams(window.location.search);
  let ref = urlParams.get("ref") || urlParams.get("token") || "";
  let source = urlParams.get("source");

  // Handle encoded-in-ref fallback (e.g. ref="CODE&source=whatsapp" or "CODE%26source%3Dwhatsapp")
  const embedded = ref.match(/^([A-Za-z0-9]+)(?:&|%26)source(?:=|%3D)([A-Za-z]+)/i);
  if (embedded) {
    ref = embedded[1];
    if (!source) source = embedded[2];
  }
  return { ref, source: source || "Direct" };
}