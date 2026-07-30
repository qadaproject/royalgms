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

Deno.serve(async (req) => {
  try {
    // Webhook verification (GET)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      const verifyToken = Deno.env.get("WHATSAPP_APP_SECRET");
      if (mode === "subscribe" && token === verifyToken && challenge) {
        return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return Response.json({ error: "Verification failed" }, { status: 403 });
    }

    if (req.method === "POST") {
      const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");
      const signature = req.headers.get("X-Hub-Signature-256") || "";
      const rawBody = await req.text();
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", encoder.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const expectedSig = "sha256=" + Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
      if (signature !== expectedSig) {
        return Response.json({ error: "Invalid signature" }, { status: 403 });
      }

      const payload = JSON.parse(rawBody);
      const base44 = createClientFromRequest(req);

      const entries = payload.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};

          // 1) Delivery / read status updates
          const statuses = value.statuses || [];
          for (const status of statuses) {
            const messageId = status.id;
            const statusValue = status.status;
            if (!messageId) continue;
            let deliveryDetail = statusValue;
            if (statusValue === "failed" && status.errors) {
              deliveryDetail = "failed: " + (status.errors.title || status.errors.code || "error");
            }
            try {
              const logs = await base44.asServiceRole.entities.NotificationLog.filter({ wa_message_id: messageId });
              for (const log of logs) {
                await base44.asServiceRole.entities.NotificationLog.update(log.id, { delivery_detail: deliveryDetail });
              }
            } catch (e) {
              console.error("Failed to update notification log: " + e.message);
            }
            try {
              const wms = await base44.asServiceRole.entities.WhatsAppMessage.filter({ wa_message_id: messageId });
              for (const wm of wms) {
                await base44.asServiceRole.entities.WhatsAppMessage.update(wm.id, { status: statusValue });
              }
            } catch (e) {
              console.error("Failed to update whatsapp message status: " + e.message);
            }
          }

          // 2) Incoming messages from guests
          const messages = value.messages || [];
          const contacts = value.contacts || [];
          const contactName = contacts[0]?.profile?.name || "";
          if (messages.length > 0) {
            let guests = [];
            try {
              guests = await base44.asServiceRole.entities.Guest.list("-created_date", 10000);
            } catch (e) {
              console.error("Failed to load guests: " + e.message);
            }
            for (const msg of messages) {
              try {
                const fromPhone = normalizePhone(msg.from);
                let text = "";
                if (msg.type === "text") text = msg.text?.body || "";
                else if (msg.type === "button") text = msg.button?.text || "";
                else if (msg.type === "interactive") text = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || "";
                else text = `[${msg.type || "message"}]`;

                const existing = await base44.asServiceRole.entities.WhatsAppMessage.filter({ wa_message_id: msg.id });
                if (existing.length > 0) continue;

                const matched = guests.find((g) => normalizePhone(g.phone) === fromPhone || normalizePhone(g.contact_person_phone) === fromPhone);
                await base44.asServiceRole.entities.WhatsAppMessage.create({
                  guest_id: matched?.id || "",
                  guest_name: matched ? (matched.full_name || contactName || msg.from) : (contactName || msg.from),
                  guest_phone: fromPhone,
                  direction: "incoming",
                  message_text: text,
                  wa_message_id: msg.id,
                  status: "delivered",
                  is_read: false,
                });
              } catch (e) {
                console.error("Failed to store incoming message: " + e.message);
              }
            }
          }
        }
      }

      return Response.json({ success: true }, { status: 200 });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});