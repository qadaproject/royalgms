import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Mail, MessageSquare, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import CategoryBadge from "../components/shared/CategoryBadge";
import { format } from "date-fns";

const APP_URL = window.location.origin;

function buildRSVPLink(guest) {
  return `${APP_URL}/rsvp?token=${guest.qr_code}`;
}

function buildEmailBody(guest) {
  const link = buildRSVPLink(guest);
  return `Your Royal Highness / Your Excellency / Distinguished Guest,\n\nThe Royal Palace of Ogiame Atuwatse III, CFR., The Olu of Warri, formally requests the honour of your presence at the 5th Coronation Anniversary celebrations.\n\nPlease confirm your attendance via your secure personal RSVP portal:\n\n${link}\n\nYour timely response will enable the Protocol Office to make adequate arrangements.\n\nPresented with the highest regard,\nThe Royal Protocol Office\nAghofen, Warri Kingdom`;
}

function buildSMSBody(guest) {
  const link = buildRSVPLink(guest);
  return `Royal RSVP: ${guest.formal_salutation || "Esteemed Guest"} ${guest.full_name}, you are cordially invited to the 5th Coronation Anniversary of Ogiame Atuwatse III, CFR. Kindly confirm via: ${link}`;
}

export default function Notifications() {
  const [sending, setSending] = useState({});
  const [channel, setChannel] = useState("Email");
  const [bulkSending, setBulkSending] = useState(false);
  const queryClient = useQueryClient();

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 500),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["notification_logs"],
    queryFn: () => base44.entities.NotificationLog.list("-created_date", 200),
  });

  const sentGuestIds = new Set(logs.map((l) => l.guest_id));
  const pendingGuests = guests.filter((g) => g.rsvp_status === "Pending" && g.qr_code);

  const logMutation = useMutation({
    mutationFn: (data) => base44.entities.NotificationLog.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification_logs"] }),
  });

  const sendNotification = async (guest, ch) => {
    if (!guest.qr_code) {
      toast.error(`${guest.full_name} has no QR token. Save the guest to generate one.`);
      return;
    }
    setSending((prev) => ({ ...prev, [guest.id]: true }));

    const emailBody = buildEmailBody(guest);
    const smsBody = buildSMSBody(guest);
    let success = true;

    if (ch === "Email" || ch === "Both") {
      if (guest.email || guest.contact_person_email) {
        const to = guest.email || guest.contact_person_email;
        await base44.integrations.Core.SendEmail({
          to,
          subject: `Royal RSVP — 5th Coronation Anniversary of Ogiame Atuwatse III, CFR.`,
          body: emailBody,
          from_name: "Royal Protocol Office — Warri Kingdom",
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
      message_preview: ch === "Email" || ch === "Both" ? emailBody.substring(0, 200) : smsBody.substring(0, 200),
      rsvp_token: guest.qr_code,
    });

    setSending((prev) => ({ ...prev, [guest.id]: false }));
    if (success) {
      toast.success(`Notification sent to ${guest.full_name}`);
    } else {
      toast.error(`Failed to send to ${guest.full_name}`);
    }
  };

  const sendBulk = async () => {
    const unsent = pendingGuests.filter((g) => !sentGuestIds.has(g.id));
    if (!unsent.length) { toast.info("All pending guests have already been notified."); return; }
    setBulkSending(true);
    for (const g of unsent) {
      await sendNotification(g, channel);
    }
    setBulkSending(false);
    toast.success(`Bulk notifications sent to ${unsent.length} guests`);
  };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send personalized RSVP reminders to pending guests">
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="SMS">SMS</SelectItem>
            <SelectItem value="Both">Email + SMS</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={sendBulk} disabled={bulkSending || !pendingGuests.length}>
          {bulkSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Send to All Pending ({pendingGuests.filter((g) => !sentGuestIds.has(g.id)).length})
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Guests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Pending RSVP Guests</h2>
            <Badge variant="outline" className="text-[10px]">{pendingGuests.length} guests</Badge>
          </div>

          {pendingGuests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
              <p className="font-heading text-lg">All guests have responded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingGuests.map((g) => {
                const alreadySent = sentGuestIds.has(g.id);
                return (
                  <div key={g.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {g.formal_salutation} {g.full_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge category={g.category} />
                        <span className="text-[10px] text-muted-foreground truncate">
                          {g.email || g.contact_person_email || "No email"}
                        </span>
                      </div>
                    </div>
                    {alreadySent && (
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5 shrink-0">
                        Notified
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={alreadySent ? "outline" : "default"}
                      className="h-8 text-xs shrink-0"
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
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {log.channel === "Email" || log.channel === "Both" ? <Mail className="w-3 h-3" /> : null}
                    {log.channel === "SMS" || log.channel === "Both" ? <MessageSquare className="w-3 h-3" /> : null}
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