import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle2, AlertTriangle, Send, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";

function getDaysUnresponded(invitation) {
  if (!invitation?.delivered_date) return null;
  return differenceInDays(new Date(), parseISO(invitation.delivered_date));
}

export default function ReminderWorkflow({ guests, invitations }) {
  const [sentIds, setSentIds] = useState(new Set());
  const [sending, setSending] = useState(false);

  // EVENT DATE — update this to match the actual event
  const EVENT_DATE = new Date("2025-07-12");
  const daysUntilEvent = differenceInDays(EVENT_DATE, new Date());
  const withinOneWeek = daysUntilEvent >= 0 && daysUntilEvent <= 7;

  // Find guests who:
  // 1. Have rsvp_status === "Pending"
  // 2. Either: within 1 week of event (auto-trigger), OR have delivered invitation older than 5 days
  // 3. Have an email address
  const eligibleGuests = guests.filter((g) => {
    if (g.rsvp_status !== "Pending") return false;
    if (!g.email && !g.contact_person_email) return false;
    // Auto-trigger within 1 week of event
    if (withinOneWeek) return true;
    // Otherwise require delivered invitation older than 5 days
    const inv = invitations.find((i) => i.guest_id === g.id && i.delivery_status === "Delivered");
    if (!inv) return false;
    const days = getDaysUnresponded(inv);
    return days !== null && days >= 5;
  }).map((g) => {
    const inv = invitations.find((i) => i.guest_id === g.id && i.delivery_status === "Delivered");
    return { ...g, _daysWaiting: getDaysUnresponded(inv), _inv: inv };
  }).sort((a, b) => (b._daysWaiting ?? 0) - (a._daysWaiting ?? 0));

  const sendReminder = async (guest) => {
    const email = guest.email || guest.contact_person_email;
    const recipientName = guest.email ? `${guest.formal_salutation || ""} ${guest.full_name}` : guest.contact_person_name;

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `RSVP Reminder — 5th Coronation Anniversary of Ogiame Atuwatse III`,
      body: `
Dear ${recipientName},

On behalf of the Royal Protocol Office, we write as a cordial reminder that your RSVP for the 5th Coronation Anniversary Ceremony of His Royal Majesty, Ogiame Atuwatse III, Olu of Warri Kingdom, is yet to be received.

Guest: ${guest.formal_salutation || ""} ${guest.full_name}${guest.post_nominals ? ", " + guest.post_nominals : ""}
${guest.official_title ? "Title: " + guest.official_title + "\n" : ""}

The ceremony is scheduled for Saturday, 12th July 2025 at the Royal Palace Grounds, Warri, Delta State.

Kindly confirm your attendance at your earliest convenience by visiting your RSVP portal or contacting the Protocol Office.

${guest.qr_code ? "Your admission token: " + guest.qr_code : ""}

We look forward to your distinguished presence.

Yours faithfully,
Royal Protocol Office
Office of His Royal Majesty, Ogiame Atuwatse III
      `.trim(),
    });
  };

  const handleSendOne = async (guest) => {
    setSending(true);
    await sendReminder(guest);
    setSentIds((prev) => new Set([...prev, guest.id]));
    setSending(false);
    toast.success(`Reminder sent to ${guest.full_name}`);
  };

  const handleSendAll = async () => {
    setSending(true);
    const toSend = eligibleGuests.filter((g) => !sentIds.has(g.id));
    for (const guest of toSend) {
      await sendReminder(guest);
      setSentIds((prev) => new Set([...prev, guest.id]));
    }
    setSending(false);
    toast.success(`${toSend.length} reminder(s) dispatched`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending RSVP Reminders
          {eligibleGuests.length > 0 && (
            <Badge variant="outline" className="ml-auto text-amber-600 border-amber-400/50 bg-amber-500/10">
              {eligibleGuests.length} awaiting
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {eligibleGuests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
            <p className="text-sm">No overdue RSVPs — all guests responded or invitations recently delivered.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {withinOneWeek
                ? `⚡ Event in ${daysUntilEvent} day(s) — all pending guests flagged for reminder`
                : "Guests with delivered invitations older than 5 days who haven't responded"}
            </p>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
              {eligibleGuests.map((g) => {
                const wasSent = sentIds.has(g.id);
                return (
                  <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {g.formal_salutation} {g.full_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {g._daysWaiting} days since delivery ·{" "}
                        {g.email ? <Mail className="w-2.5 h-2.5 inline" /> : <Users className="w-2.5 h-2.5 inline" />}
                        {g.email || g.contact_person_email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={wasSent ? "outline" : "default"}
                      disabled={wasSent || sending}
                      onClick={() => handleSendOne(g)}
                      className="h-7 text-xs shrink-0"
                    >
                      {wasSent ? (
                        <><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Sent</>
                      ) : sending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><Send className="w-3 h-3 mr-1" /> Remind</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleSendAll}
              disabled={sending || eligibleGuests.every((g) => sentIds.has(g.id))}
              className="w-full"
              size="sm"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending reminders...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send All Reminders ({eligibleGuests.filter((g) => !sentIds.has(g.id)).length})</>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}