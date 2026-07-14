import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, Printer } from "lucide-react";
import RoyalCrest from "../components/layout/RoyalCrest";
import InvitationCard from "@/components/invitations/InvitationCard";

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
        body { background: #3d0a06; }
        @media print {
          .no-print { display: none !important; }
          body { background: #6b1a12 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
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
      <InvitationCard guest={guest} settings={settings} />
      {/* Update RSVP / Itinerary Button */}
<div className="no-print mt-4">
  <a
    href={itineraryUrl}
    className="flex items-center justify-center gap-2 text-[#c9a84c] border border-[#c9a84c]/50 hover:bg-[#c9a84c]/10 transition-colors rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider"
  >
    Update RSVP / Itinerary
  </a>
</div>
    </div>
  );
}