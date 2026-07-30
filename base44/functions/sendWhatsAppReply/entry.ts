import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function normalizePhone(phone) {
  if (!phone) return "";
  let p = phone.toString().replace(/\D/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) return "234" + p.slice(1);
  if (p.startsWith("234")) return p;
  if (p.length === 10 && /^[789]/.test(p)) return "234" + p;
  return p;
}

export default async function(req) {
  try {
    const body = await req.json();
    const { phone, guest_id, guest_name, message } = body;
    if (!phone || !message) {
      return Response.json({ error: 'phone and message are required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");
    if (!accessToken || !phoneNumberId || !appSecret) {
      return Response.json({ error: 'WhatsApp secrets not configured' }, { status: 400 });
    }

    const recipient = normalizePhone(phone);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(accessToken));
    const appsecretProof = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages?appsecret_proof=${appsecretProof}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body: message },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return Response.json({ error: result.error?.message || "Meta WhatsApp API error" }, { status: 500 });
    }

    const waMessageId = result.messages?.[0]?.id || "";
    const messageStatus = result.messages?.[0]?.message_status || "sent";

    const created = await base44.entities.WhatsAppMessage.create({
      guest_id: guest_id || "",
      guest_name: guest_name || phone,
      guest_phone: recipient,
      direction: "outgoing",
      message_text: message,
      wa_message_id: waMessageId,
      status: messageStatus,
      is_read: true,
    });

    return Response.json({ success: true, message: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}