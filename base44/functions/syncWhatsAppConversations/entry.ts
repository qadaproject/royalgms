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
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Backfill outgoing WhatsApp messages from existing NotificationLog entries
    const logs = await base44.asServiceRole.entities.NotificationLog.list("-created_date", 10000);
    const waLogs = logs.filter((l) => (l.channel || "").includes("WhatsApp"));

    const existing = await base44.asServiceRole.entities.WhatsAppMessage.list("-created_date", 10000);
    const existingIds = new Set(existing.map((m) => m.wa_message_id).filter(Boolean));

    let synced = 0;
    const MAX_PER_RUN = 60;
    for (const log of waLogs) {
      if (synced >= MAX_PER_RUN) break;
      const key = log.wa_message_id || `log:${log.id}`;
      if (existingIds.has(key)) continue;
      const detail = (log.delivery_detail || "").toLowerCase();
      let status = "sent";
      if (detail.includes("read")) status = "read";
      else if (detail.includes("delivered")) status = "delivered";
      else if (detail.includes("failed") || log.status === "Failed") status = "failed";
      await base44.asServiceRole.entities.WhatsAppMessage.create({
        guest_id: log.guest_id || "",
        guest_name: log.guest_name || log.guest_phone || "",
        guest_phone: normalizePhone(log.guest_phone),
        direction: "outgoing",
        message_text: log.message_preview || "",
        wa_message_id: key,
        status,
        is_read: true,
      });
      existingIds.add(key);
      synced++;
    }

    return Response.json({ success: true, synced, total: existing.length + synced });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}