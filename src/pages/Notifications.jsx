import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Mail, MessageSquare, CheckCircle2, Loader2, RefreshCw, Search, Phone } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import CategoryBadge from "../components/shared/CategoryBadge";
import ReminderWorkflow from "../components/notifications/ReminderWorkflow";
import { format } from "date-fns";

const APP_URL = window.location.origin;

function buildInviteLink(guest) {
  return `${APP_URL}/invite-detail?token=${guest.qr_code}`;
}

function applyTemplate(template, guest) {
  const name = `${guest.formal_salutation || ""} ${guest.full_name}`.trim();
  const link = buildInviteLink(guest);
  return (template || "")
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{link\}\}/g, link);
}

const DEFAULT_EMAIL_TEMPLATE = `Your Royal Highness / Your Excellency / Distinguished Guest,

The Royal Palace of Ògíame Atúwàtse III, CFR, The Olu of Warri, formally requests the honour of your presence at the 5th Coronation Anniversary celebrations.

Dear {{name}},

Please download your personalized invitation via the link below:
{{link}}

Your timely response will enable the Protocol Office to make adequate arrangements.

Presented with the highest regard,
The Royal Protocol Office
Aghofen, Warri Kingdom`;

const DEFAULT_SMS_TEMPLATE = `Hello {{name}}, you are cordially invited to the 5th Coronation Anniversary of Ogiame Atuwatse III, CFR. Download your invitation: {{link}}`;
const DEFAULT_EMAIL_SUBJECT = `Royal RSVP — 5th Coronation Anniversary of Ògíame Atúwàtse III, CFR`;

export default function Notifications() {
  const [sending, setSending] = useState({});
  const [channel, setChannel] = useState("Email");
  const [bulkSending, setBulkSending] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => base44.entities.Invitation.list("-created_date", 500),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["notification_logs"],
    queryFn: () => base44.entities.NotificationLog.list("-created_date", 500),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["event_settings"],
    queryFn: () => base44.entities.EventSettings.list("-created_date", 1),
  });

  const eventSettings = settings[0] || {};

  // Count sends per guest
  const sendCountByGuest = useMemo(() => {
    const counts = {};
    for (const log of logs) {
      counts[log.guest_id] = (counts[log.guest_id] || 0) + 1;
    }
    return counts;
  }, [logs]);

  const sentGuestIds = new Set(logs.map((l) => l.guest_id));
  const pendingGuests = guests.filter((g) => g.rsvp_status === "Pending" && g.qr_code);

  const filteredGuests = useMemo(() => {
    if (!search.trim()) return pendingGuests;
    const q = search.toLowerCase();
    return pendingGuests.filter((g) =>
      `${g.formal_salutation || ""} ${g.full_name}`.toLowerCase().includes(q) ||
      (g.email || "").toLowerCase().includes(q) ||
      (g.contact_person_email || "").toLowerCase().includes(q) ||
      (g.phone || "").includes(q) ||
      (g.contact_person_phone || "").includes(q) ||
      (g.category || "").toLowerCase().includes(q)
    );
  }, [pendingGuests, search]);

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
    const emailBody = applyTemplate(emailTemplate, guest);
    const smsBody = applyTemplate(smsTemplate, guest);

    let success = true;

    if (ch === "Email" || ch === "Email + SMS" || ch === "Email + WhatsApp") {
      const to = guest.email || guest.contact_person_email;
      if (to) {
        await base44.integrations.Core.SendEmail({
          to,
          subject: emailSubject,
          body: emailBody,
          from_name: "Royal Protocol Office — Warri Kingdom",
        }).catch(() => { success = false; });
      }
    }

    if (ch === "SMS" || ch === "Email + SMS") {
      const phone = guest.phone || guest.contact_person_phone;
      if (phone) {
        await base44.functions.invoke("sendSMS", {
          phone,
          messageBody: smsBody,
        }).catch(() => { success = false; });
      }
    }

    if (ch === "WhatsApp" || ch === "Email + WhatsApp") {
      const phone = guest.phone || guest.contact_person_phone;
      if (phone) {
        await base44.functions.invoke("sendWhatsApp", {
          phone,
          messageBody: smsBody,
          parameters: smsBody,
        }).catch(() => { success = false; });
      }
    }

    await logMutation.mutateAsync({
      guest_id: guest.id,
      guest_name: guest.full_name,
      guest_email: guest.email || guest.contact_person_email || "",
      guest_phone: guest.phone || guest.contact_person_phone || "",
      channel: ch,
      status: success ? "Sent" : "Failed",
      message_preview: emailBody.substring(0, 200),
      rsvp_token: guest.qr_code,
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
            <h2 className="font-heading text-lg font-semibold">Pending RSVP Guests</h2>
            <Badge variant="outline" className="text-[10px]">{filteredGuests.length} shown</Badge>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, category..."
              className="pl-8 h-9 text-sm"
            />
          </div>

          {filteredGuests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
              <p className="font-heading text-lg">{search ? "No matching guests" : "All guests have responded"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGuests.map((g) => {
                const alreadySent = sentGuestIds.has(g.id);
                const sendCount = sendCountByGuest[g.id] || 0;
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
                        <span className={`text-[10px] truncate ${!hasEmail ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                          {hasEmail ? (g.email || g.contact_person_email) : "No email"}
                        </span>
                        <span className={`text-[10px] truncate ${!hasPhone ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                          · {hasPhone ? (g.phone || g.contact_person_phone) : "No phone"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sendCount > 0 && (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground border-border">
                          ×{sendCount} sent
                        </Badge>
                      )}
                      {alreadySent && (
                        <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                          Notified
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant={alreadySent ? "outline" : "default"}
                        className="h-8 text-xs"
                        disabled={!!sending[g.id]}
                        onClick={() => sendNotification(g, channel)}
                      >
                        {sending[g.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : alreadySent ? (
                          <><RefreshCw className="w-3 h-3 mr-1" /> Resend</>
                        ) : (
                          <><Send className="w-3 h-3 mr-1" /> Send</>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Log */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4">Notification Log</h2>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No notifications sent yet</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {logs.map((log) => (
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}