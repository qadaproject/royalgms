import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    // Webhook verification (GET — Meta confirms the endpoint during setup)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      // Uses WHATSAPP_APP_SECRET as the verify token — enter the same value
      // in Meta WhatsApp Manager → Configuration → Webhook → Verify Token
      const verifyToken = Deno.env.get("WHATSAPP_APP_SECRET");

      if (mode === "subscribe" && token === verifyToken && challenge) {
        return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return Response.json({ error: "Verification failed" }, { status: 403 });
    }

    // Status update (POST — Meta sends real-time delivery receipts)
    if (req.method === "POST") {
      const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");
      const signature = req.headers.get("X-Hub-Signature-256") || "";
      const rawBody = await req.text();

      // Validate X-Hub-Signature-256 to confirm the request is genuinely from Meta
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw", encoder.encode(appSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const expectedSig = "sha256=" + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

      if (signature !== expectedSig) {
        return Response.json({ error: "Invalid signature" }, { status: 403 });
      }

      const payload = JSON.parse(rawBody);
      const base44 = createClientFromRequest(req);

      const entries = payload.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const statuses = change.value?.statuses || [];
          for (const status of statuses) {
            const messageId = status.id;
            const statusValue = status.status; // sent, delivered, read, failed
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