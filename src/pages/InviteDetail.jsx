import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, Printer } from "lucide-react";
import RoyalCrest from "../components/layout/RoyalCrest";

export default function InviteDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("ref") || urlParams.get("token");

  const [guest, setGuest] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
    <div className="min-h-screen bg-[#6b0f0f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#6b0f0f] flex flex-col items-center justify-center text-[#f5ede0] px-4">
      <AlertTriangle className="w-12 h-12 text-[#c9a84c] mb-4" />
      <h2 className="font-heading text-2xl mb-2">Invitation Not Found</h2>
      <p className="text-[#f5ede0]/60 text-sm text-center">This invitation code is invalid or has expired. Please contact the Protocol Office.</p>
    </div>
  );

  const handlePrint = () => window.print();
  const itineraryUrl = `/itinerary?ref=${guest?.qr_code}`;

  const guestName = [guest.formal_salutation, guest.full_name, guest.post_nominals ? `, ${guest.post_nominals}` : ""].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-[#5a0a0a] flex flex-col items-center justify-center py-8 px-4">
      <style>{`
        body { background: #5a0a0a; }
        @media print {
          .no-print { display: none !important; }
          body { background: #7a1010 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          @page { size: A4 portrait; margin: 10mm; }
          .invite-card { box-shadow: none !important; }
        }
      `}</style>

      {/* Print button */}
      <div className="no-print mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-[#c9a84c] border border-[#c9a84c]/50 hover:bg-[#c9a84c]/10 transition-colors rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Invitation
        </button>
      </div>

      {/* Invitation Card */}
      <div
        className="invite-card relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, #9b1515 0%, #6b0c0c 40%, #4a0808 100%)",
          border: "2px solid #c9a84c",
        }}
      >
        {/* Gold corner brackets */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#c9a84c] rounded-tl-sm" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#c9a84c] rounded-tr-sm" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#c9a84c] rounded-bl-sm" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#c9a84c] rounded-br-sm" />

        <div className="px-10 py-10 text-center">
          {/* Crest */}
          <div className="flex justify-center mb-4">
            <RoyalCrest size="lg" />
          </div>

          {/* His Majesty line */}
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.35em] mb-1">His Majesty</p>
          <p className="font-heading text-xl font-semibold text-[#f5ede0] leading-snug">
            Ògíame Atúwàtse III, CFR,
          </p>
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.25em] mb-4">The Olu of Warri,</p>

          <p className="text-[#f5ede0]/70 text-xs italic tracking-[0.2em] uppercase mb-5">Formally Invites</p>

          {/* Guest Name */}
          <p className="font-heading text-2xl font-bold text-[#f5ede0] leading-tight mb-1">
            {guestName}
          </p>
          {guest.official_title && (
            <p className="text-[#c9a84c]/80 text-sm italic mb-4">{guest.official_title}</p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 justify-center">
            <div className="flex-1 h-px bg-[#c9a84c]/30 max-w-[60px]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/50" />
            <div className="flex-1 h-px bg-[#c9a84c]/30 max-w-[60px]" />
          </div>

          <p className="text-[#c9a84c]/70 text-[10px] uppercase tracking-[0.3em] mb-1">To The</p>
          <p className="font-heading text-2xl font-bold text-[#c9a84c] uppercase tracking-wide leading-tight mb-1">
            {settings?.event_name || "5th Coronation Anniversary"}
          </p>
          <p className="text-[#f5ede0]/50 text-xs mb-6">
            {settings?.event_subtitle || "Ogiame Atuwatse III, Olu of Warri Kingdom"}
          </p>

          {/* Details Table */}
          <div
            className="rounded-lg mb-6 text-left overflow-hidden"
            style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {[
              { label: "DATE", value: settings?.event_date },
              { label: "VENUE", value: settings?.venue_name || settings?.venue_address },
              { label: "TIME", value: settings?.event_time },
            ].filter(d => d.value).map((row, i, arr) => (
              <div key={row.label} className={`flex items-start gap-4 px-5 py-2.5 ${i < arr.length - 1 ? "border-b border-[#c9a84c]/10" : ""}`}>
                <span className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-[0.2em] w-12 shrink-0 pt-0.5">{row.label}</span>
                <span className="text-[#f5ede0] text-sm">{row.value}</span>
              </div>
            ))}
            {/* Category + Seating divider row */}
            <div className="border-t border-[#c9a84c]/20 grid grid-cols-2">
              <div className="px-5 py-3 border-r border-[#c9a84c]/10">
                <p className="text-[#c9a84c] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Category</p>
                <p className="text-[#f5ede0] text-sm">{guest.category || "—"}</p>
              </div>
              <div className="px-5 py-3">
                <p className="text-[#c9a84c] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Seating Zone</p>
                <p className="text-[#f5ede0] text-sm">{guest.seating_zone || "To be assigned"}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-3">
            <div className="bg-white p-3 rounded-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                alt="QR"
                className="w-36 h-36"
              />
            </div>
          </div>
          <p className="text-[#f5ede0]/40 text-[9px] uppercase tracking-[0.3em] mb-1">Scan to View Invitation</p>
          <p className="text-[#c9a84c] font-mono font-bold text-lg tracking-[0.3em] mb-6">{guest.qr_code}</p>

          {/* Footer note */}
          <p className="text-[#f5ede0]/30 text-[10px] italic">
            {settings?.footer_note || "This invitation is non-transferable. Please present upon arrival at the security checkpoint."}
          </p>

          {/* Update RSVP link */}
          <div className="no-print mt-5">
            <a
              href={itineraryUrl}
              className="text-[#c9a84c]/60 text-xs underline underline-offset-2 hover:text-[#c9a84c] transition-colors"
            >
              Update your RSVP / Itinerary →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}