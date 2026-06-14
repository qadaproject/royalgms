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
    width: "100%",
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
    <div style={card} className="invite-card">
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
    const win = window.open("", "_blank");
    const guestName = [guest.formal_salutation, guest.full_name, guest.post_nominals].filter(Boolean).join(" ");
    const eventDate = formatEventDate(eventSettings?.event_date);
    const venue = [eventSettings?.venue_name, eventSettings?.venue_address].filter(Boolean).join(", ") || "TBC";
    const time = eventSettings?.event_time || "TBC";
    const eventName = eventSettings?.event_name || "5th Coronation Anniversary";
    const eventSubtitle = eventSettings?.event_subtitle || "Ogiame Atuwatse III, Olu of Warri Kingdom";

    win.document.write(`<!DOCTYPE html>
<html><head><title>Invitation — ${guest.full_name}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A5 portrait; margin: 0; }
  html, body { width: 148mm; height: 210mm; background: #1a0302; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  body { display: flex; align-items: center; justify-content: center; }
  .card {
    width: 138mm; height: 200mm;
    background: radial-gradient(ellipse at 50% 30%, #8b1a10 0%, #5a0e08 40%, #3a0806 100%);
    border: 2.5px solid #c9a84c;
    border-radius: 10px;
    position: relative;
    display: flex; flex-direction: column; align-items: center;
    padding: 12mm 10mm 8mm;
    font-family: 'Cormorant Garamond', Georgia, serif;
    color: #f5ede0;
    overflow: hidden;
  }
  .corner { position: absolute; width: 18px; height: 18px; border-color: #c9a84c; border-style: solid; border-width: 0; }
  .c-tl { top: 10px; left: 10px; border-top-width: 2px; border-left-width: 2px; }
  .c-tr { top: 10px; right: 10px; border-top-width: 2px; border-right-width: 2px; }
  .c-bl { bottom: 10px; left: 10px; border-bottom-width: 2px; border-left-width: 2px; }
  .c-br { bottom: 10px; right: 10px; border-bottom-width: 2px; border-right-width: 2px; }
  .crest { width: 52px; height: 52px; object-fit: contain; margin-bottom: 6px; }
  .label { color: #c9a84c; font-family: 'Inter', sans-serif; font-size: 7pt; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
  .king-name { font-size: 15pt; font-weight: 700; color: #f5ede0; letter-spacing: 0.04em; text-align: center; line-height: 1.2; }
  .king-title { color: #c9a84c; font-size: 8pt; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 2px; }
  .divider { width: 60px; height: 1px; background: #c9a84c; margin: 6px auto; }
  .formally { color: rgba(245,237,224,0.7); font-size: 8pt; letter-spacing: 0.22em; text-transform: uppercase; font-style: italic; margin: 4px 0; }
  .guest-name { font-size: 18pt; font-weight: 700; color: #f5ede0; text-align: center; line-height: 1.25; margin: 4px 0 2px; }
  .guest-title { color: rgba(201,168,76,0.85); font-size: 9pt; font-style: italic; margin-bottom: 2px; }
  .to-the { color: rgba(245,237,224,0.7); font-size: 7.5pt; letter-spacing: 0.22em; text-transform: uppercase; font-style: italic; margin: 2px 0; }
  .event-name { font-size: 14pt; font-weight: 700; color: #c9a84c; letter-spacing: 0.07em; text-transform: uppercase; text-align: center; line-height: 1.3; margin: 2px 0; }
  .event-sub { color: rgba(245,237,224,0.4); font-size: 7.5pt; letter-spacing: 0.1em; margin-top: 3px; }
  .details-box {
    background: rgba(0,0,0,0.28);
    border-radius: 6px; padding: 8px 12px;
    width: 100%; margin: 6px 0;
  }
  .detail-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 5px; }
  .detail-row:last-child { margin-bottom: 0; }
  .dl { color: #c9a84c; font-family: 'Inter', sans-serif; font-size: 6.5pt; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; min-width: 36px; }
  .dv { color: #f5ede0; font-size: 9pt; font-weight: 500; }
  .cat-zone { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(201,168,76,0.25); }
  .cz-label { color: rgba(201,168,76,0.7); font-family: 'Inter', sans-serif; font-size: 6pt; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 2px; }
  .cz-val { color: #f5ede0; font-size: 9pt; font-weight: 600; }
  .qr-wrap { background: #fff; padding: 6px; border-radius: 6px; border: 2px solid #c9a84c; margin: 6px 0 3px; }
  .qr-wrap img { width: 80px; height: 80px; display: block; }
  .scan-label { color: rgba(201,168,76,0.7); font-family: 'Inter', sans-serif; font-size: 6pt; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 3px; }
  .qr-code { color: #c9a84c; font-family: monospace; font-size: 9pt; font-weight: 700; letter-spacing: 0.2em; margin-top: 2px; }
  .footer { color: rgba(245,237,224,0.3); font-family: 'Inter', sans-serif; font-size: 6pt; font-style: italic; letter-spacing: 0.03em; text-align: center; margin-top: 5px; line-height: 1.5; }
</style></head>
<body>
<div class="card">
  <div class="corner c-tl"></div>
  <div class="corner c-tr"></div>
  <div class="corner c-bl"></div>
  <div class="corner c-br"></div>

  <img class="crest" src="https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/d9072c6be_atuwatseiii.png" alt="Crest" />

  <p class="label">His Majesty</p>
  <p class="king-name">Ògíame Atúwàtse III, CFR,</p>
  <p class="king-title">The Olu of Warri,</p>

  <div class="divider"></div>
  <p class="formally">Formally Invites</p>
  <div class="divider"></div>

  <p class="guest-name">${guestName}</p>
  ${guest.official_title ? `<p class="guest-title">${guest.official_title}</p>` : ""}

  <div class="divider" style="margin-top:6px;"></div>

  <p class="to-the">To the</p>
  <p class="event-name">${eventName}</p>
  <p class="event-sub">${eventSubtitle}</p>

  <div class="divider"></div>

  <div class="details-box">
    <div class="detail-row"><span class="dl">Date</span><span class="dv">${eventDate}</span></div>
    <div class="detail-row"><span class="dl">Venue</span><span class="dv">${venue}</span></div>
    <div class="detail-row" style="margin-bottom:0"><span class="dl">Time</span><span class="dv">${time}</span></div>
    <div class="cat-zone">
      <div><p class="cz-label">Category</p><p class="cz-val">${guest.category || "—"}</p></div>
      <div><p class="cz-label">Seating Zone</p><p class="cz-val">${guest.seating_zone || "To be assigned"}</p></div>
    </div>
  </div>

  <div class="qr-wrap">
    <img src="${qrImgUrl}" alt="QR" />
  </div>
  <p class="scan-label">Scan to view invitation</p>
  <p class="qr-code">${guest.qr_code}</p>

  <p class="footer">This invitation is non-transferable. Please present upon arrival at the security checkpoint.</p>
</div>
</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 900);
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