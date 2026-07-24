import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import RoyalCrest from "../components/layout/RoyalCrest";
import InvitationCard from "@/components/invitations/InvitationCard";
import { logLinkAccess, parseRefAndSource } from "@/lib/logLinkAccess";

export default function InviteDetail() {
  const { ref, source } = parseRefAndSource();
  const token = ref;

  const [guest, setGuest] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [logged, setLogged] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    Promise.all([
      base44.entities.Guest.filter({ qr_code: token.toUpperCase() }, "-created_date", 1),
      base44.entities.EventSettings.list("-created_date", 1),
    ]).then(([guests, settingsList]) => {
      if (guests && guests.length > 0) {
        const g = guests[0];
        setGuest(g);
        setSettings(settingsList[0] || null);
        if (!logged) {
          setLogged(true);
          logLinkAccess(g, "Invitation", source);
        }
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

  const itineraryUrl = `/itinerary?ref=${guest?.qr_code}${source && source !== "Direct" ? `&source=${source}` : ""}`;

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        backgroundColor: "#3d0a06",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.height / canvas.width;
      let renderWidth = pageWidth - 20;
      let renderHeight = renderWidth * imgRatio;
      if (renderHeight > pageHeight - 20) {
        renderHeight = pageHeight - 20;
        renderWidth = renderHeight / imgRatio;
      }
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
      const namePart = [guest.formal_salutation, guest.full_name]
        .filter(Boolean)
        .join(" ")
        .replace(/\./g, "")
        .replace(/\s+/g, "_")
        .replace(/^_+|_+$/g, "");
      pdf.save(`${namePart}_${guest.qr_code}.pdf`);
    } catch (e) {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

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

      {/* Download button */}
      <div className="no-print mb-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 text-[#c9a84c] border border-[#c9a84c]/50 hover:bg-[#c9a84c]/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>

      {/* Invitation Card */}
      <div ref={cardRef}>
        <InvitationCard guest={guest} settings={settings} />
      </div>
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