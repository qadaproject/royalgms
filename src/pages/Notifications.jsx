import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Mail, MessageSquare, CheckCircle2, Loader2, RefreshCw, Search, Phone, AlertTriangle, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import CategoryBadge from "../components/shared/CategoryBadge";
import ReminderWorkflow from "../components/notifications/ReminderWorkflow";
import { getTierForCategory } from "@/lib/guestTiers";
import { format } from "date-fns";

const APP_URL = window.location.origin;

function buildInviteLink(guest, source) {
  const base = `${APP_URL}/invite-detail?ref=${guest.qr_code}`;
  return source ? `${base}&source=${source}` : base;
}

function applyTemplate(template, guest, source) {
  const name = `${guest.formal_salutation || ""} ${guest.full_name}`.trim();
  const link = buildInviteLink(guest, source);
  return (template || "")
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{link\}\}/g, link);
}

function formatPhone(phone) {
  if (!phone) return null;
  let p = phone.toString().replace(/\D/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) return "234" + p.slice(1);
  if (p.startsWith("234")) return p;
  if (p.length === 10 && /^[789]/.test(p)) return "234" + p;
  // International number — return as-is (already has country code)
  return p;
}

function isNigerianPhone(phone) {
  if (!phone) return false;
  let p = phone.toString().replace(/\D/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("234")) return true;
  if (p.startsWith("0")) return true;
  if (p.length === 10 && /^[789]/.test(p)) return true;
  return false;
}

function buildHtmlEmail(guest, bodyText, eventSettings, source) {
  const name = `${guest.formal_salutation || ""} ${guest.full_name}`.trim();
  const link = buildInviteLink(guest, source);
  const eventName = eventSettings.event_name || "5th Coronation Anniversary of Ògíame Atúwàtse III, CFR";
  const eventDate = eventSettings.event_date ? new Date(eventSettings.event_date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
  const venue = eventSettings.venue_name || "";
  const contactPhone = eventSettings.contact_phone || "";
  const contactEmail = eventSettings.contact_email || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${eventName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background-color:#5c1a1a;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px 0;color:#c9a84c;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-family:'Arial',sans-serif;">Royal Protocol Office</p>
            <h1 style="margin:0;color:#f5f0e8;font-size:22px;font-weight:400;letter-spacing:2px;font-family:'Georgia',serif;">WARRI KINGDOM</h1>
            <div style="margin:12px auto 0;width:60px;height:1px;background:#c9a84c;"></div>
            <p style="margin:10px 0 0;color:#c9a84c;font-size:11px;letter-spacing:2px;font-family:'Arial',sans-serif;">OFFICIAL INVITATION</p>
          </td>
        </tr>

        <!-- Gold divider -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#c9a84c,#e8d08a,#c9a84c);"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;color:#1a0a06;">
            <p style="margin:0 0 20px;color:#7a5c1e;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:'Arial',sans-serif;">Your Invitation</p>
            <p style="margin:0 0 16px;font-size:16px;color:#2d1a0a;line-height:1.6;">Your Royal Highness / Your Excellency / Distinguished Guest,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#3d2a1a;line-height:1.8;">Dear <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#3d2a1a;line-height:1.8;">The Royal Palace of His Majesty, <strong>Ògíame Atúwàtse III, CFR</strong>, The Olu of Warri, formally requests the honour of your presence at the <strong>${eventName}</strong>.</p>
            
            ${eventDate ? `<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#fdf6e3;border-left:3px solid #c9a84c;border-radius:0 4px 4px 0;width:100%;"><tr><td style="padding:12px 16px;"><p style="margin:0;font-size:12px;color:#7a5c1e;letter-spacing:2px;text-transform:uppercase;font-family:'Arial',sans-serif;">Date &amp; Venue</p><p style="margin:4px 0 0;font-size:14px;color:#2d1a0a;font-weight:bold;">${eventDate}</p>${venue ? `<p style="margin:2px 0 0;font-size:13px;color:#5a3a1a;">${venue}</p>` : ""}</td></tr></table>` : ""}
            <p style="margin:0 0 28px;font-size:14px;color:#3d2a1a;line-height:1.8;">Please access your personalised invitation and RSVP using the secure link below. Your timely response will enable the Protocol Office to make adequate arrangements.</p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:#5c1a1a;border-radius:2px;padding:0;">
                  <a href="${link}" style="display:inline-block;padding:14px 32px;color:#f5f0e8;font-family:'Arial',sans-serif;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">View My Invitation</a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:12px;color:#888;font-family:'Arial',sans-serif;">If the button above does not work, copy and paste this link into your browser:</p>
            <p style="margin:0 0 32px;font-size:11px;color:#c9a84c;word-break:break-all;font-family:'Arial',sans-serif;">${link}</p>

            <p style="margin:0;font-size:14px;color:#3d2a1a;line-height:1.8;">Presented with the highest regard,<br/><strong>The Royal Protocol Office</strong><br/><span style="color:#7a5c1e;font-size:13px;">Aghofen, Warri Kingdom</span></p>
          </td>
        </tr>

        <!-- Gold divider -->
        <tr><td style="height:2px;background:linear-gradient(90deg,#c9a84c,#e8d08a,#c9a84c);"></td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1a0a06;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#c9a84c;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:'Arial',sans-serif;">Royal Protocol Office</p>
            <p style="margin:0 0 10px;color:#888;font-size:10px;font-family:'Arial',sans-serif;">Aghofen, Warri Kingdom, Delta State, Nigeria</p>
            ${contactPhone || contactEmail ? `<p style="margin:0;color:#666;font-size:10px;font-family:'Arial',sans-serif;">${contactPhone ? `Tel: ${contactPhone}` : ""}${contactPhone && contactEmail ? " &nbsp;|&nbsp; " : ""}${contactEmail ? `Email: ${contactEmail}` : ""}</p>` : ""}
            <p style="margin:12px 0 0;color:#444;font-size:9px;font-family:'Arial',sans-serif;">This is an official communication from the Royal Palace. Please do not reply to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const DEFAULT_EMAIL_TEMPLATE = `{{name}}`; // placeholder — HTML is generated via buildHtmlEmail

const DEFAULT_SMS_TEMPLATE = `Hello {{name}}, you are cordially invited to the 5th Coronation Anniversary of Ogiame Atuwatse III, CFR. Download your invitation: {{link}}`;
const DEFAULT_EMAIL_SUBJECT = `Royal RSVP — 5th Coronation Anniversary of Ògíame Atúwàtse III, CFR`;

export default function Notifications() {
  const [sending, setSending] = useState({});
  const [channel, setChannel] = useState("Email");
  const [bulkSending, setBulkSending] = useState(false);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [logSearch, setLogSearch] = useState("");
  const [logChannelFilter, setLogChannelFilter] = useState("All");
  const [logStatusFilter, setLogStatusFilter] = useState("All");
  const [logOriginFilter, setLogOriginFilter] = useState("All");
  const queryClient = useQueryClient();

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 10000),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 10000),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["notification_logs"],
    queryFn: () => base44.entities.NotificationLog.list("-created_date", 10000),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["event_settings"],
    queryFn: () => base44.entities.EventSettings.list("-created_date", 1),
  });

  const eventSettings = settings[0] || {};

  const [confirmGuest, setConfirmGuest] = useState(null); // { guest, channel }

  // Count SUCCESSFUL sends per guest per channel
  const sendCountByGuestChannel = useMemo(() => {
    const counts = {};
    for (const log of logs) {
      if (log.status !== "Sent") continue;
      if (!counts[log.guest_id]) counts[log.guest_id] = { Email: 0, SMS: 0, WhatsApp: 0 };
      const ch = log.channel || "";
      if (ch.includes("Email")) counts[log.guest_id].Email = (counts[log.guest_id].Email || 0) + 1;
      if (ch.includes("SMS")) counts[log.guest_id].SMS = (counts[log.guest_id].SMS || 0) + 1;
      if (ch.includes("WhatsApp")) counts[log.guest_id].WhatsApp = (counts[log.guest_id].WhatsApp || 0) + 1;
    }
    return counts;
  }, [logs]);

  const sendCountByGuest = useMemo(() => {
    const counts = {};
    for (const log of logs) {
      if (log.status !== "Sent") continue;
      counts[log.guest_id] = (counts[log.guest_id] || 0) + 1;
    }
    return counts;
  }, [logs]);

  const sentGuestIds = new Set(logs.map((l) => l.guest_id));

  const filteredGuests = useMemo(() => {
    let list = guests.filter((g) => g.qr_code);
    if (rsvpFilter !== "All") list = list.filter((g) => g.rsvp_status === rsvpFilter);
    if (tierFilter !== "All Tiers") list = list.filter((g) => (g.tier || getTierForCategory(g.category)) === tierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) =>
        `${g.formal_salutation || ""} ${g.full_name}`.toLowerCase().includes(q) ||
        (g.email || "").toLowerCase().includes(q) ||
        (g.contact_person_email || "").toLowerCase().includes(q) ||
        (g.phone || "").includes(q) ||
        (g.contact_person_phone || "").includes(q) ||
        (g.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [guests, search, rsvpFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        if (!log.guest_name?.toLowerCase().includes(q) && !(log.guest_phone || "").includes(q) && !(log.guest_email || "").toLowerCase().includes(q)) return false;
      }
      if (logChannelFilter !== "All") {
        const ch = log.channel || "";
        if (logChannelFilter === "WhatsApp" && !ch.includes("WhatsApp")) return false;
        if (logChannelFilter === "Email" && !ch.includes("Email")) return false;
        if (logChannelFilter === "SMS" && !ch.includes("SMS")) return false;
      }
      if (logStatusFilter !== "All" && log.status !== logStatusFilter) return false;
      if (logOriginFilter !== "All") {
        const isForeign = !isNigerianPhone(log.guest_phone);
        if (logOriginFilter === "Nigerian" && isForeign) return false;
        if (logOriginFilter === "Foreign" && !isForeign) return false;
      }
      return true;
    });
  }, [logs, logSearch, logChannelFilter, logStatusFilter, logOriginFilter]);

  const logMutation = useMutation({
    mutationFn: (data) => base44.entities.NotificationLog.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification_logs"] }),
  });

  const sendNotification = async (guest, ch) => {
    if (!guest.qr_code) {
      toast.error(`${guest.full_name} has no QR token. Re-save the guest to generate one.`);
      return;
    }
    setSending((prev) => ({ ...prev, [guest.id]: true }));

    const emailTemplate = eventSettings.email_template || DEFAULT_EMAIL_TEMPLATE;
    const smsTemplate = eventSettings.sms_template || DEFAULT_SMS_TEMPLATE;
    const emailSubject = eventSettings.email_subject || DEFAULT_EMAIL_SUBJECT;
    const emailBody = applyTemplate(emailTemplate, guest, "email");
    const smsBody = applyTemplate(smsTemplate, guest, "sms");

    let success = true;
    let waDeliveryDetail = "";
    let waMessageId = "";

    if (ch === "Email" || ch === "Email + SMS" || ch === "Email + WhatsApp") {
      const htmlBody = buildHtmlEmail(guest, emailBody, eventSettings, "email");
      const emailRecipients = [guest.email, guest.contact_person_email].filter(Boolean);
      const uniqueRecipients = [...new Set(emailRecipients)];
      if (uniqueRecipients.length > 0) {
        for (const to of uniqueRecipients) {
          try {
            const res = await base44.functions.invoke("sendEmail", {
              to,
              subject: emailSubject,
              html: htmlBody,
              from_name: "Royal Protocol Office Warri Kingdom",
            });
            if (res?.data?.error) success = false;
          } catch {
            success = false;
          }
        }
      } else {
        success = false;
      }
    }

    if (ch === "SMS" || ch === "Email + SMS") {
      const rawPhone = guest.phone || guest.contact_person_phone;
      const phone = formatPhone(rawPhone);
      if (phone) {
        try {
          const res = await base44.functions.invoke("sendSMS", { phone, messageBody: smsBody });
          if (res?.data?.error || res?.data?.result?.status === "error") {
            success = false;
          }
        } catch {
          success = false;
        }
      } else {
        success = false;
      }
    }

    if (ch === "WhatsApp" || ch === "Email + WhatsApp") {
      const rawPhone = guest.phone || guest.contact_person_phone;
      const phone = formatPhone(rawPhone);
      const guestName = `${guest.formal_salutation || ""} ${guest.full_name}`.trim();
      if (phone) {
        try {
          const res = await base44.functions.invoke("sendWhatsApp", {
            phone,
            name: guestName,
            qr_code: guest.qr_code,
          });
          if (res?.data?.error) {
            success = false;
            waDeliveryDetail = res.data.error;
          } else {
            waDeliveryDetail = res?.data?.message_status || "";
            waMessageId = res?.data?.result?.messages?.[0]?.id || "";
          }
        } catch (e) {
          success = false;
          waDeliveryDetail = e?.message || "Send failed";
        }
      } else {
        success = false;
      }
    }

    const rawPhoneForLog = guest.phone || guest.contact_person_phone || "";
    await logMutation.mutateAsync({
      guest_id: guest.id,
      guest_name: guest.full_name,
      guest_email: guest.email || guest.contact_person_email || "",
      guest_phone: rawPhoneForLog,
      channel: ch,
      status: success ? "Sent" : "Failed",
      message_preview: emailBody.substring(0, 200),
      rsvp_token: guest.qr_code,
      is_international: !!rawPhoneForLog && !isNigerianPhone(rawPhoneForLog),
      delivery_detail: waDeliveryDetail || "",
      wa_message_id: waMessageId || "",
    });

    base44.entities.GuestActivityLog.create({
      guest_id: guest.id,
      guest_name: guest.full_name,
      event_type: "notification_sent",
      description: `${ch} notification ${success ? "sent" : "failed"}`,
      new_value: success ? "Sent" : "Failed",
    }).catch(() => {});

    setSending((prev) => ({ ...prev, [guest.id]: false }));
    if (success) {
      toast.success(`Notification sent to ${guest.full_name}`);
    } else {
      toast.error(`Failed to send to ${guest.full_name}`);
    }
  };

  const sendBulk = async () => {
    const unsent = filteredGuests.filter((g) => !sentGuestIds.has(g.id));
    if (!unsent.length) { toast.info("All filtered guests have already been notified."); return; }
    setBulkSending(true);
    for (const g of unsent) {
      await sendNotification(g, channel);
    }
    setBulkSending(false);
    toast.success(`Bulk notifications sent to ${unsent.length} guests`);
  };

  const channelIcon = (ch) => {
    if (ch === "SMS") return <MessageSquare className="w-3 h-3" />;
    if (ch === "WhatsApp") return <Phone className="w-3 h-3 text-green-600" />;
    if (ch === "Email") return <Mail className="w-3 h-3" />;
    return <Bell className="w-3 h-3" />;
  };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send personalized RSVP reminders to pending guests">
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="SMS">SMS</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Email + SMS">Email + SMS</SelectItem>
            <SelectItem value="Email + WhatsApp">Email + WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={sendBulk} disabled={bulkSending || !filteredGuests.length}>
          {bulkSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Send to All ({filteredGuests.filter((g) => !sentGuestIds.has(g.id)).length} unsent)
        </Button>
      </PageHeader>

      {/* Automated Reminder Workflow */}
      <div className="mb-6">
        <ReminderWorkflow guests={guests} invitations={invitations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Guests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-lg font-semibold">All Guests</h2>
            <Badge variant="outline" className="text-[10px]">{filteredGuests.length} shown</Badge>
          </div>

          {/* Search + RSVP Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, category..."
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All RSVP</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
                <SelectItem value="Proxy">Proxy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Tiers">All Tiers</SelectItem>
                <SelectItem value="Tier 1">Tier 1</SelectItem>
                <SelectItem value="Tier 2">Tier 2</SelectItem>
                <SelectItem value="Tier 3">Tier 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
              <p className="font-heading text-lg">{search || rsvpFilter !== "All" ? "No matching guests" : "No guests in registry"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGuests.map((g) => {
                const hasEmail = !!(g.email || g.contact_person_email);
                const hasPhone = !!(g.phone || g.contact_person_phone);
                return (
                  <div key={g.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {g.formal_salutation} {g.full_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <CategoryBadge category={g.category} />
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${g.rsvp_status === "Accepted" ? "text-emerald-600 border-emerald-500/30" : g.rsvp_status === "Declined" ? "text-red-500 border-red-400/30" : g.rsvp_status === "Proxy" ? "text-purple-500 border-purple-400/30" : "text-amber-600 border-amber-400/30"}`}>{g.rsvp_status || "Pending"}</Badge>
                        <span className={`text-[10px] truncate ${!hasEmail ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                          {hasEmail ? (g.email || g.contact_person_email) : "No email"}
                        </span>
                        <span className={`text-[10px] truncate ${!hasPhone ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                          · {hasPhone ? (g.phone || g.contact_person_phone) : "No phone"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {/* Per-channel counters */}
                      <div className="flex items-center gap-1">
                        {[
                          { ch: "Email", icon: <Mail className="w-3 h-3" />, color: "text-blue-600 border-blue-400/30 bg-blue-500/5" },
                          { ch: "SMS", icon: <MessageSquare className="w-3 h-3" />, color: "text-amber-600 border-amber-400/30 bg-amber-500/5" },
                          { ch: "WhatsApp", icon: <Phone className="w-3 h-3" />, color: "text-green-600 border-green-400/30 bg-green-500/5" },
                        ].map(({ ch, icon, color }) => {
                          const cnt = sendCountByGuestChannel[g.id]?.[ch] || 0;
                          return (
                            <button
                              key={ch}
                              title={`Send ${ch}`}
                              disabled={!!sending[g.id]}
                              onClick={() => setConfirmGuest({ guest: g, channel: ch })}
                              className={`flex items-center gap-1 rounded-md px-2 py-1 border text-[10px] font-medium transition-all hover:opacity-80 disabled:opacity-40 ${color}`}
                            >
                              {icon}
                              <span>{cnt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {sending[g.id] && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Log */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3">Notification Log</h2>
          {/* Log Filters */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search log by name, phone, email..."
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Select value={logChannelFilter} onValueChange={setLogChannelFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Channels</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={logStatusFilter} onValueChange={setLogStatusFilter}>
                <SelectTrigger className="h-8 w-[100px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={logOriginFilter} onValueChange={setLogOriginFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Numbers</SelectItem>
                  <SelectItem value="Nigerian">Nigerian</SelectItem>
                  <SelectItem value="Foreign">Foreign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{logs.length === 0 ? "No notifications sent yet" : "No logs match filters"}</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-medium truncate flex-1">{log.guest_name}</p>
                    <Badge variant="outline" className={`text-[9px] shrink-0 ${log.status === "Sent" ? "text-emerald-600 border-emerald-500/30" : "text-red-600 border-red-500/30"}`}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {channelIcon(log.channel)}
                    <span>{log.channel}</span>
                    <span>·</span>
                    <span>{log.created_date ? format(new Date(log.created_date), "MMM d, HH:mm") : ""}</span>
                  </div>
                  {log.is_international && log.guest_phone && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/5 px-1.5 py-0.5 text-[8px] font-semibold text-blue-600">
                        <Globe className="w-2.5 h-2.5" /> International
                      </span>
                      {log.channel?.includes("WhatsApp") && (() => {
                        const detail = (log.delivery_detail || "").toLowerCase();
                        const isDelivered = detail.includes("delivered") || detail.includes("read");
                        const isFailed = detail.includes("failed") || log.status === "Failed";
                        const colorClass = isDelivered ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/5" : isFailed ? "text-red-600 border-red-500/30" : "text-amber-600 border-amber-500/30 bg-amber-500/5";
                        const label = log.status === "Sent" ? (log.delivery_detail ? `Meta: ${log.delivery_detail}` : "Accepted") : (log.delivery_detail || "Failed");
                        return <Badge variant="outline" className={`text-[8px] px-1 py-0 ${colorClass}`}>{label}</Badge>;
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmGuest} onOpenChange={(o) => { if (!o) setConfirmGuest(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" /> Confirm Send
            </DialogTitle>
          </DialogHeader>
          {confirmGuest && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are about to send a <strong>{confirmGuest.channel}</strong> notification to:
              </p>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-semibold text-sm">{confirmGuest.guest.formal_salutation} {confirmGuest.guest.full_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{confirmGuest.channel === "Email" ? (confirmGuest.guest.email || confirmGuest.guest.contact_person_email || "No email") : (confirmGuest.guest.phone || confirmGuest.guest.contact_person_phone || "No phone")}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmGuest(null)}>Cancel</Button>
                <Button className="flex-1" onClick={() => { const { guest: g, channel: ch } = confirmGuest; setConfirmGuest(null); sendNotification(g, ch); }}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Send Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}