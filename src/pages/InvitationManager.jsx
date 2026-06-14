import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Printer, Send, Eye, Mail, QrCode, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/shared/PageHeader";
import CategoryBadge from "../components/shared/CategoryBadge";
import InvitationCardModal from "../components/invitations/InvitationCardModal";

export default function InvitationManager() {
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 10000),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["event_settings"],
    queryFn: () => base44.entities.EventSettings.list("-created_date", 1),
  });

  const eventSettings = settings[0] || {};

  const sendInviteLinkMutation = useMutation({
    mutationFn: async (guest) => {
      const link = `${window.location.origin}/rsvp?token=${guest.qr_code}`;
      await base44.integrations.Core.SendEmail({
        to: guest.email,
        subject: `Royal Invitation — ${eventSettings.event_name || "5th Coronation Anniversary"}`,
        body: `Dear ${guest.formal_salutation || ""} ${guest.full_name},\n\nYou are cordially invited to the ${eventSettings.event_name || "5th Coronation Anniversary"} of Ògíame Atúwàtse III, CFR.\n\nDate: ${eventSettings.event_date || ""}\nTime: ${eventSettings.event_time || ""}\nVenue: ${eventSettings.venue_name || ""}\n\nPlease RSVP via your personal link:\n${link}\n\n${eventSettings.footer_note || "The Royal Protocol Office\nWarri Kingdom"}`,
      });
    },
    onSuccess: (_, guest) => {
      toast.success(`Invitation link sent to ${guest.full_name}`);
    },
    onError: () => toast.error("Failed to send invitation link"),
  });

  const filtered = guests.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.full_name?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q) ||
      g.rsvp_status?.toLowerCase().includes(q) ||
      g.official_title?.toLowerCase().includes(q)
    );
  });

  const handleOpenCard = (guest) => {
    setSelectedGuest(guest);
    setModalOpen(true);
  };

  const rsvpStatusColor = {
    Accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Declined: "bg-red-100 text-red-800 border-red-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Proxy: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <div>
      <PageHeader
        title="Invitation Manager"
        subtitle={`${guests.length} guests — generate, print or send invitations`}
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, category, or RSVP status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((guest) => (
            <Card key={guest.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-base font-semibold truncate">
                      {guest.formal_salutation} {guest.full_name}
                    </p>
                    {guest.post_nominals && (
                      <p className="text-xs text-accent font-semibold">{guest.post_nominals}</p>
                    )}
                    {guest.official_title && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{guest.official_title}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${rsvpStatusColor[guest.rsvp_status] || rsvpStatusColor.Pending}`}>
                    {guest.rsvp_status || "Pending"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <CategoryBadge category={guest.category} compact />
                  {guest.seating_zone && (
                    <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                      {guest.seating_zone}
                    </span>
                  )}
                </div>

                {/* QR Token */}
                {guest.qr_code && (
                  <div className="flex items-center gap-2 mb-3 bg-muted/50 rounded-lg p-2">
                    <QrCode className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold tracking-wider flex-1 truncate">{guest.qr_code}</span>
                    <a
                      href={`/rsvp?token=${guest.qr_code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:text-accent/80"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => handleOpenCard(guest)}
                  >
                    <Eye className="w-3 h-3 mr-1.5" />
                    View / Print
                  </Button>
                  {guest.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => sendInviteLinkMutation.mutate(guest)}
                      disabled={sendInviteLinkMutation.isPending}
                    >
                      <Send className="w-3 h-3 mr-1.5" />
                      Send Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGuest && (
        <InvitationCardModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          guest={selectedGuest}
          eventSettings={eventSettings}
        />
      )}
    </div>
  );
}