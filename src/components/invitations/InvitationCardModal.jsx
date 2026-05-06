import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

export default function InvitationCardModal({ open, onOpenChange, guest, eventSettings }) {
  const printRef = useRef();

  if (!guest) return null;

  const qrUrl = `${window.location.origin}/invite-detail?token=${guest.qr_code}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Invitation — ${guest.full_name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #fff; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Invitation Card</DialogTitle>
        </DialogHeader>

        {/* Print-ready invitation card */}
        <div ref={printRef}>
          <div style={{
            background: "linear-gradient(135deg, #3d0a06 0%, #6b1a12 50%, #3d0a06 100%)",
            border: "3px solid #c9a84c",
            borderRadius: "12px",
            padding: "40px",
            color: "#f5ede0",
            fontFamily: "'Cormorant Garamond', serif",
            position: "relative",
            maxWidth: "600px",
            margin: "0 auto",
          }}>
            {/* Gold corner ornaments */}
            <div style={{ position: "absolute", top: 12, left: 12, width: 24, height: 24, borderTop: "2px solid #c9a84c", borderLeft: "2px solid #c9a84c" }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderTop: "2px solid #c9a84c", borderRight: "2px solid #c9a84c" }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 24, height: 24, borderBottom: "2px solid #c9a84c", borderLeft: "2px solid #c9a84c" }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 24, height: 24, borderBottom: "2px solid #c9a84c", borderRight: "2px solid #c9a84c" }} />

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
                The Palace of
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f5ede0", margin: "0 0 4px", letterSpacing: "0.04em" }}>
                Ògíame Atúwàtse III, CFR
              </h2>
              <p style={{ color: "#c9a84c", fontSize: 12, letterSpacing: "0.15em" }}>The Olu of Warri</p>
              <div style={{ width: 80, height: 1, background: "#c9a84c", margin: "12px auto" }} />
            </div>

            {/* Body text */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#f5ede0cc", marginBottom: 20, fontStyle: "italic" }}>
              {eventSettings.invitation_body || "requests the honour of your presence at the"}
            </p>

            <h3 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "#c9a84c", margin: "0 0 4px", letterSpacing: "0.06em" }}>
              {eventSettings.event_name || "5th Coronation Anniversary"}
            </h3>
            {eventSettings.event_subtitle && (
              <p style={{ textAlign: "center", color: "#f5ede0aa", fontSize: 12, marginTop: 4 }}>{eventSettings.event_subtitle}</p>
            )}

            <div style={{ width: 80, height: 1, background: "#c9a84c55", margin: "20px auto" }} />

            {/* Guest */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ color: "#c9a84c", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>In Honour of</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#f5ede0", margin: 0 }}>
                {guest.formal_salutation} {guest.full_name}
                {guest.post_nominals ? `, ${guest.post_nominals}` : ""}
              </p>
              {guest.official_title && (
                <p style={{ color: "#c9a84ccc", fontSize: 13, marginTop: 4 }}>{guest.official_title}</p>
              )}
            </div>

            {/* Event details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
              {[
                { label: "Date", value: eventSettings.event_date || "TBC" },
                { label: "Time", value: eventSettings.event_time || "TBC" },
                { label: "Venue", value: eventSettings.venue_name || "TBC" },
                { label: "Dress Code", value: eventSettings.dress_code || "TBC" },
                { label: "Category", value: guest.category || "—" },
                { label: "Seating Zone", value: guest.seating_zone || "To be assigned" },
                { label: "RSVP Status", value: guest.rsvp_status || "Pending" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ color: "#c9a84c99", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
                  <p style={{ color: "#f5ede0", fontSize: 12, fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* QR Code */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ background: "#fff", padding: 8, borderRadius: 8, border: "2px solid #c9a84c" }}>
                <img src={qrImgUrl} alt="QR" style={{ width: 120, height: 120, display: "block" }} />
              </div>
              <p style={{ color: "#c9a84c99", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Scan to view invitation details
              </p>
              <p style={{ color: "#c9a84c", fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.2em" }}>
                {guest.qr_code}
              </p>
            </div>

            {/* Footer */}
            {eventSettings.footer_note && (
              <p style={{ textAlign: "center", color: "#f5ede055", fontSize: 10, marginTop: 20, fontStyle: "italic" }}>
                {eventSettings.footer_note}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Print Invitation
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}