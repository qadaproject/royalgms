import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const VIP_CATEGORIES = ["A - Royal", "B - Federal", "E - Diplomatic"];

// WhatsApp number to alert (admin's number)
const ADMIN_PHONE = "2347065177007";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    // Only act on create events for GuestActivityLog
    if (event?.type !== "create") {
      return Response.json({ skipped: "not a create event" });
    }

    const log = data;

    // Must be a check-in scan log entry
    if (!log || log.event_type !== "rsvp_status_changed") {
      return Response.json({ skipped: "not a check-in log" });
    }

    // Fetch the guest to check category
    const guests = await base44.asServiceRole.entities.Guest.filter({ id: log.guest_id }, "-created_date", 1);
    if (!guests?.length) {
      return Response.json({ skipped: "guest not found" });
    }

    const guest = guests[0];

    // Only alert for VIP categories
    if (!VIP_CATEGORIES.includes(guest.category)) {
      return Response.json({ skipped: `not a VIP category: ${guest.category}` });
    }

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");

    // Generate appsecret_proof
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(accessToken));
    const appsecretProof = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

    const guestName = [guest.formal_salutation, guest.full_name, guest.post_nominals].filter(Boolean).join(" ");
    const gate = log.performed_by || "Gate";
    const time = new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

    const message = `🔔 *VIP ARRIVAL ALERT*\n\n👤 *${guestName}*\n🏷️ ${guest.official_title || guest.category}\n📍 ${gate}\n🕐 ${time}\n\nEnsure protocol reception is ready.`;

    const whatsappPayload = {
      messaging_product: "whatsapp",
      to: ADMIN_PHONE,
      type: "text",
      text: { body: message }
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages?appsecret_proof=${appsecretProof}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(whatsappPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      return Response.json({ error: result.error?.message || "WhatsApp API error", details: result }, { status: 500 });
    }

    return Response.json({ success: true, guest: guest.full_name, category: guest.category, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});