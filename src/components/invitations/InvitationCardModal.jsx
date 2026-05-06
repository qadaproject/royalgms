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
  const s = {
    card: {
      background: "linear-gradient(160deg, #2a0800 0%, #5a1208 40%, #3d0a06 70%, #1a0300 100%)",
      border: "3px double #c9a84c",
      borderRadius: "4px",
      padding: "48px 44px",
      color: "#f5ede0",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      position: "relative",
      maxWidth: "620px",
      margin: "0 auto",
      boxSizing: "border-box",
    },
    goldLine: { width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", margin: "0" },
    goldLineThin: { width: "60%", height: "1px", background: "linear-gradient(90deg, transparent, #c9a84c88, transparent)", margin: "0 auto" },
    corner: (pos) => ({
      position: "absolute",
      width: 28, height: 28,
      ...pos,
      borderColor: "#c9a84c",
      borderStyle: "solid",
      borderWidth: 0,
      ...(pos.top !== undefined && pos.left !== undefined ? { borderTopWidth: 2, borderLeftWidth: 2 } : {}),
      ...(pos.top !== undefined && pos.right !== undefined ? { borderTopWidth: 2, borderRightWidth: 2 } : {}),
      ...(pos.bottom !== undefined && pos.left !== undefined ? { borderBottomWidth: 2, borderLeftWidth: 2 } : {}),
      ...(pos.bottom !== undefined && pos.right !== undefined ? { borderBottomWidth: 2, borderRightWidth: 2 } : {}),
    }),
  };

  return (
    <div style={s.card}>
      {/* Corner ornaments */}
      <div style={s.corner({ top: 10, left: 10 })} />
      <div style={s.corner({ top: 10, right: 10 })} />
      <div style={s.corner({ bottom: 10, left: 10 })} />
      <div style={s.corner({ bottom: 10, right: 10 })} />

      {/* === HEADER === */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {/* Crest placeholder / logo area */}
        <div style={{ marginBottom: 16 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blank_coat_of_arms.svg/120px-Blank_coat_of_arms.svg.png"
            alt="Royal Crest"
            style={{ width: 64, height: 64, objectFit: "contain", filter: "sepia(1) saturate(3) hue-rotate(5deg) brightness(1.2)", display: "inline-block" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>

        <p style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
          His Majesty
        </p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f5ede0", margin: "0 0 2px", letterSpacing: "0.05em", lineHeight: 1.2, textTransform: "uppercase" }}>
          Ògíame Atúwàtse III, CFR,
        </h1>
        <p style={{ color: "#c9a84c", fontSize: 13, letterSpacing: "0.2em", margin: "0 0 20px", textTransform: "uppercase", fontWeight: 600 }}>
          The Olu of Warri
        </p>

        <div style={s.goldLine} />
        <div style={{ padding: "14px 0" }}>
          <p style={{ color: "#f5ede0bb", fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", margin: 0, fontStyle: "italic" }}>
            Formally Invites
          </p>
        </div>
        <div style={s.goldLine} />
      </div>

      {/* === INVITEE === */}
      <div style={{ textAlign: "center", padding: "22px 0 20px" }}>
        <p style={{ fontSize: 26, fontWeight: 700, color: "#f5ede0", margin: "0 0 4px", letterSpacing: "0.02em", lineHeight: 1.2 }}>
          {[guest.formal_salutation, guest.full_name, guest.post_nominals ? guest.post_nominals : null].filter(Boolean).join(" ")}
        </p>
        {guest.official_title && (
          <p style={{ color: "#c9a84c", fontSize: 13, margin: "6px 0 0", fontStyle: "italic", letterSpacing: "0.05em" }}>
            {guest.official_title}
          </p>
        )}
      </div>

      <div style={s.goldLineThin} />

      {/* === EVENT TITLE === */}
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ color: "#f5ede0bb", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 8px", fontStyle: "italic" }}>
          To the
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#c9a84c", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.3 }}>
          {eventSettings.event_name || "5th Coronation Anniversary"}
        </h2>
        {eventSettings.event_subtitle && (
          <p style={{ color: "#f5ede066", fontSize: 11, margin: "6px 0 0", letterSpacing: "0.1em" }}>{eventSettings.event_subtitle}</p>
        )}
      </div>

      <div style={s.goldLineThin} />

      {/* === EVENT DETAILS === */}
      <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", minWidth: 44, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Date</span>
          <span style={{ color: "#f5ede0", fontSize: 14, fontWeight: 500 }}>
            {formatEventDate(eventSettings.event_date)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", minWidth: 44, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Venue</span>
          <span style={{ color: "#f5ede0", fontSize: 14, fontWeight: 500 }}>
            {eventSettings.venue_name || "TBC"}{eventSettings.venue_address ? `, ${eventSettings.venue_address}` : ""}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", minWidth: 44, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Time</span>
          <span style={{ color: "#f5ede0", fontSize: 14, fontWeight: 500 }}>
            {eventSettings.event_time || "TBC"}
          </span>
        </div>
        {eventSettings.dress_code && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", minWidth: 44, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Attire</span>
            <span style={{ color: "#f5ede0", fontSize: 14, fontWeight: 500 }}>{eventSettings.dress_code}</span>
          </div>
        )}
      </div>

      <div style={s.goldLine} />

      {/* === CATEGORY & ZONE === */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, padding: "16px 0" }}>
        <div style={{ borderRight: "1px solid #c9a84c33", paddingRight: 16 }}>
          <p style={{ color: "#c9a84c", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Category</p>
          <p style={{ color: "#f5ede0", fontSize: 13, fontWeight: 600, margin: 0 }}>{guest.category || "—"}</p>
        </div>
        <div style={{ paddingLeft: 16 }}>
          <p style={{ color: "#c9a84c", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Seating Zone</p>
          <p style={{ color: "#f5ede0", fontSize: 13, fontWeight: 600, margin: 0 }}>{guest.seating_zone || "To be assigned"}</p>
        </div>
      </div>

      <div style={s.goldLine} />

      {/* === QR CODE === */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 16px" }}>
        <div style={{ background: "#fff", padding: 10, borderRadius: 6, border: "2px solid #c9a84c", marginBottom: 10 }}>
          <img src={qrImgUrl} alt="QR Code" style={{ width: 120, height: 120, display: "block" }} />
        </div>
        <p style={{ color: "#c9a84c99", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 6px", fontFamily: "'Inter', sans-serif" }}>
          Scan to view invitation details
        </p>
        <p style={{ color: "#c9a84c", fontSize: 12, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.25em", margin: 0 }}>
          {guest.qr_code}
        </p>
      </div>

      <div style={s.goldLine} />

      {/* === FOOTER === */}
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <p style={{ color: "#f5ede044", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
          This invitation is non-transferable. Please present upon arrival at the security checkpoint.
        </p>
      </div>
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