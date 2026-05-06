import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

function formatEventDate(dateStr) {
  if (!dateStr) return "TBC";
  try {
    return format(new Date(dateStr), "EEEE MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function InvitationCard({ guest, eventSettings, qrImgUrl }) {
  const card = {
    background: "linear-gradient(135deg, #3d0a06 0%, #6b1a12 50%, #3d0a06 100%)",
    border: "3px solid #c9a84c",
    borderRadius: "12px",
    padding: "40px",
    color: "#f5ede0",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    position: "relative",
    maxWidth: "600px",
    margin: "0 auto",
    boxSizing: "border-box",
  };

  const goldDivider = {
    width: "80px", height: "1px",
    background: "#c9a84c",
    margin: "12px auto",
  };

  const corner = (top, right, bottom, left) => ({
    position: "absolute",
    width: 24, height: 24,
    ...(top !== undefined ? { top } : {}),
    ...(right !== undefined ? { right } : {}),
    ...(bottom !== undefined ? { bottom } : {}),
    ...(left !== undefined ? { left } : {}),
    borderColor: "#c9a84c",
    borderStyle: "solid",
    borderWidth: 0,
    ...(top !== undefined && left !== undefined ? { borderTopWidth: 2, borderLeftWidth: 2 } : {}),
    ...(top !== undefined && right !== undefined ? { borderTopWidth: 2, borderRightWidth: 2 } : {}),
    ...(bottom !== undefined && left !== undefined ? { borderBottomWidth: 2, borderLeftWidth: 2 } : {}),
    ...(bottom !== undefined && right !== undefined ? { borderBottomWidth: 2, borderRightWidth: 2 } : {}),
  });

  return (
    <div style={card}>
      {/* Corner ornaments */}
      <div style={corner(12, undefined, undefined, 12)} />
      <div style={corner(12, 12, undefined, undefined)} />
      <div style={corner(undefined, undefined, 12, 12)} />
      <div style={corner(undefined, 12, 12, undefined)} />

      {/* === LOGO === */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img
          src="https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/d9072c6be_atuwatseiii.png"
          alt="Royal Crest"
          style={{ width: 80, height: 80, objectFit: "contain", display: "inline-block" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>

      {/* === HEADER === */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <p style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
          His Majesty
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f5ede0", margin: "0 0 2px", letterSpacing: "0.04em", lineHeight: 1.2 }}>
          Ògíame Atúwàtse III, CFR,
        </h2>
        <p style={{ color: "#c9a84c", fontSize: 12, letterSpacing: "0.15em", margin: "0 0 4px", textTransform: "uppercase" }}>
          The Olu of Warri,
        </p>
        <div style={goldDivider} />

        <p style={{ color: "#f5ede0bb", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", margin: "12px 0", fontStyle: "italic" }}>
          Formally Invites
        </p>
        <div style={goldDivider} />
      </div>

      {/* === INVITEE === */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}></p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#f5ede0", margin: 0, lineHeight: 1.25 }}>
          {[guest.formal_salutation, guest.full_name, guest.post_nominals || null].filter(Boolean).join(" ")}
        </p>
        {guest.official_title && (
          <p style={{ color: "#c9a84ccc", fontSize: 13, marginTop: 6, fontStyle: "italic" }}>
            {guest.official_title}
          </p>
        )}
      </div>

      <div style={goldDivider} />

      {/* === EVENT TITLE === */}
      <div style={{ textAlign: "center", margin: "16px 0" }}>
        <p style={{ color: "#f5ede0bb", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px", fontStyle: "italic" }}>
          To the
        </p>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#c9a84c", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.3 }}>
          {eventSettings.event_name || "5th Coronation Anniversary"}
        </h3>
        {eventSettings.event_subtitle && (
          <p style={{ color: "#f5ede066", fontSize: 11, margin: "6px 0 0", letterSpacing: "0.1em" }}>{eventSettings.event_subtitle}</p>
        )}
      </div>

      <div style={goldDivider} />

      {/* === EVENT DETAILS === */}
      <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "16px 20px", margin: "16px 0" }}>
        {[
          { label: "Date", value: formatEventDate(eventSettings.event_date) },
          { label: "Venue", value: [eventSettings.venue_name, eventSettings.venue_address].filter(Boolean).join(", ") || "TBC" },
          { label: "Time", value: eventSettings.event_time || "TBC" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
            <span style={{ color: "#c9a84c", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", minWidth: 40, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{label}</span>
            <span style={{ color: "#f5ede0", fontSize: 13, fontWeight: 500 }}>{value}</span>
          </div>
        ))}

        {/* Category & Zone row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 6, paddingTop: 12, borderTop: "1px solid rgba(201,168,76,0.2)" }}>
          <div>
            <p style={{ color: "#c9a84c99", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'Inter', sans-serif" }}>Category</p>
            <p style={{ color: "#f5ede0", fontSize: 12, fontWeight: 600, margin: 0 }}>{guest.category || "—"}</p>
          </div>
          <div>
            <p style={{ color: "#c9a84c99", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 2, fontFamily: "'Inter', sans-serif" }}>Seating Zone</p>
            <p style={{ color: "#f5ede0", fontSize: 12, fontWeight: 600, margin: 0 }}>{guest.seating_zone || "To be assigned"}</p>
          </div>
        </div>
      </div>

      {/* === QR CODE === */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
        <div style={{ background: "#fff", padding: 8, borderRadius: 8, border: "2px solid #c9a84c" }}>
          <img src={qrImgUrl} alt="QR Code" style={{ width: 120, height: 120, display: "block" }} />
        </div>
        <p style={{ color: "#c9a84c99", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, fontFamily: "'Inter', sans-serif" }}>
          Scan to view invitation details
        </p>
        <p style={{ color: "#c9a84c", fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.2em", margin: 0 }}>
          {guest.qr_code}
        </p>
      </div>

      {/* === FOOTER === */}
      <p style={{ textAlign: "center", color: "#f5ede055", fontSize: 9, marginTop: 20, fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", letterSpacing: "0.03em" }}>
        This invitation is non-transferable. Please present upon arrival at the security checkpoint.
      </p>
    </div>
  );
}

export default function InvitationCardModal({ open, onOpenChange, guest, eventSettings }) {
  const printRef = useRef();

  if (!guest) return null;

  const qrUrl = `${window.location.origin}/invite-detail?token=${guest.qr_code}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Invitation — ${guest.full_name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 24px; background: #0d0300; display:flex; justify-content:center; align-items:flex-start; min-height:100vh; }
        @page { size: A5 portrait; margin: 10mm; }
        @media print { body { background:#0d0300; print-color-adjust: exact; -webkit-print-color-adjust: exact; padding: 0; } }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0300]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[#c9a84c]">Invitation Card</DialogTitle>
        </DialogHeader>

        <div ref={printRef}>
          <InvitationCard guest={guest} eventSettings={eventSettings} qrImgUrl={qrImgUrl} />
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={handlePrint} className="flex-1 bg-[#c9a84c] hover:bg-[#b8963e] text-[#1a0a06] font-semibold">
            <Printer className="w-4 h-4 mr-2" />
            Print Invitation
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}