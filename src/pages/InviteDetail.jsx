import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, CheckCircle2, MapPin, Calendar, Clock, Shirt, Printer } from "lucide-react";
import RoyalCrest from "../components/layout/RoyalCrest";
import CategoryBadge from "../components/shared/CategoryBadge";
import InviteDetailPrintSidebar from "../components/invitations/InviteDetailPrintSidebar";

const rsvpColors = {
  Accepted: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Pending: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Declined: "text-red-400 bg-red-400/10 border-red-400/30",
  Proxy: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

export default function InviteDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [guest, setGuest] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    Promise.all([
      base44.entities.Guest.filter({ qr_code: token.toUpperCase() }, "-created_date", 1),
      base44.entities.EventSettings.list("-created_date", 1),
    ]).then(([guests, settingsList]) => {
      if (guests && guests.length > 0) {
        setGuest(guests[0]);
        setSettings(settingsList[0] || null);
      } else {
        setNotFound(true);
      }
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-[#1a0a06] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#1a0a06] flex flex-col items-center justify-center text-[#f5ede0] px-4">
      <AlertTriangle className="w-12 h-12 text-[#c9a84c] mb-4" />
      <h2 className="font-heading text-2xl mb-2">Invitation Not Found</h2>
      <p className="text-[#f5ede0]/60 text-sm text-center">This invitation code is invalid or has expired. Please contact the Protocol Office.</p>
    </div>
  );

  const rsvpClass = rsvpColors[guest.rsvp_status] || rsvpColors.Pending;

  return (
    <div className="min-h-screen bg-[#1a0a06] text-[#f5ede0]">
      <InviteDetailPrintSidebar
        guest={guest}
        settings={settings}
        open={printOpen}
        onClose={() => setPrintOpen(false)}
      />

      {/* Header */}
      <header className="text-center py-10 px-4 border-b border-[#c9a84c]/20">
        <div className="flex justify-end px-4 pt-2 absolute top-4 right-4">
          <button
            onClick={() => setPrintOpen(true)}
            className="flex items-center gap-2 text-[#c9a84c] border border-[#c9a84c]/40 hover:bg-[#c9a84c]/10 transition-colors rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <RoyalCrest size="xl" />
        </div>
        <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">Official Invitation</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-[#f5ede0] tracking-wide">
          {settings?.event_name || "5th Coronation Anniversary"}
        </h1>
        <p className="text-[#c9a84c]/80 text-sm mt-1">Ògíame Atúwàtse III, CFR — The Olu of Warri</p>
        <div className="w-24 h-px bg-[#c9a84c]/40 mx-auto mt-4" />
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Invitee */}
        <div className="bg-[#2a110a]/60 border border-[#c9a84c]/20 rounded-xl p-6 text-center">
          <p className="text-[#c9a84c]/70 text-[10px] uppercase tracking-[0.3em] mb-3">This Invitation is Extended to</p>
          <p className="font-heading text-2xl font-semibold text-[#f5ede0]">
            {guest.formal_salutation} {guest.full_name}
            {guest.post_nominals ? `, ${guest.post_nominals}` : ""}
          </p>
          {guest.official_title && (
            <p className="text-[#c9a84c]/80 text-sm mt-2">{guest.official_title}</p>
          )}
          <div className="mt-3 flex justify-center">
            <CategoryBadge category={guest.category} />
          </div>
        </div>

        {/* RSVP Status */}
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${rsvpClass}`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold">RSVP Status</p>
            <p className="text-base font-semibold">{guest.rsvp_status || "Pending"}</p>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-[#2a110a]/60 border border-[#c9a84c]/20 rounded-xl p-5 space-y-4">
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.25em] font-semibold">Event Details</p>
          {[
            { icon: Calendar, label: "Date", value: settings?.event_date },
            { icon: Clock, label: "Time", value: settings?.event_time },
            { icon: MapPin, label: "Venue", value: settings?.venue_name },
            { icon: MapPin, label: "Address", value: settings?.venue_address },
            { icon: Shirt, label: "Dress Code", value: settings?.dress_code },
          ].filter((d) => d.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-[#c9a84c] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#f5ede0]/40 text-[10px] uppercase tracking-wider">{label}</p>
                <p className="text-[#f5ede0] text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Seating */}
        {(guest.seating_zone || guest.category) && (
          <div className="bg-[#2a110a]/60 border border-[#c9a84c]/20 rounded-xl p-5 space-y-3">
            <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.25em] font-semibold">Guest Assignment</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#f5ede0]/40 text-[10px] uppercase tracking-wider mb-1">Category</p>
                <CategoryBadge category={guest.category} />
              </div>
              <div>
                <p className="text-[#f5ede0]/40 text-[10px] uppercase tracking-wider mb-1">Seating Zone</p>
                <p className="text-[#f5ede0] text-sm font-medium">{guest.seating_zone || "To be assigned"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Admission Token */}
        <div className="text-center">
          <p className="text-[#f5ede0]/30 text-xs uppercase tracking-wider mb-3">Admission Token</p>
          <div className="inline-block bg-white p-3 rounded-xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(window.location.href)}`}
              alt="QR"
              className="w-32 h-32"
            />
          </div>
          <p className="text-[#c9a84c] text-sm font-mono font-bold tracking-[0.25em] mt-2">{guest.qr_code}</p>
        </div>

        {settings?.footer_note && (
          <p className="text-center text-[#f5ede0]/30 text-xs italic pb-6">{settings.footer_note}</p>
        )}
      </main>
    </div>
  );
}