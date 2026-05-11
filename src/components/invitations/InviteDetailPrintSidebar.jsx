import { Printer, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function formatEventDate(dateStr) {
  if (!dateStr) return "TBC";
  try { return format(new Date(dateStr), "EEEE MMMM d, yyyy"); }
  catch { return dateStr; }
}

function buildPrintHTML(guest, settings) {
  const qrUrl = `${window.location.origin}/invite-detail?token=${guest.qr_code}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
  const guestName = [guest.formal_salutation, guest.full_name, guest.post_nominals || null].filter(Boolean).join(" ");
  const venue = [settings?.venue_name, settings?.venue_address].filter(Boolean).join(", ") || "TBC";

  return `
    <html><head>
    <title>Invitation — ${guest.full_name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @page { size: A5 portrait; margin: 8mm; }
      body { background: #1a0a06; print-color-adjust: exact; -webkit-print-color-adjust: exact;
             display: flex; justify-content: center; align-items: flex-start;
             min-height: 100vh; font-family: 'Cormorant Garamond', Georgia, serif; }
      @media print { body { background: #1a0a06; } }
      .card {
        background: linear-gradient(135deg, #3d0a06 0%, #6b1a12 50%, #3d0a06 100%);
        border: 3px solid #c9a84c; border-radius: 12px; padding: 32px;
        color: #f5ede0; width: 100%; max-width: 420px; position: relative;
      }
      .corner { position: absolute; width: 22px; height: 22px; border-color: #c9a84c; border-style: solid; border-width: 0; }
      .tl { top: 10px; left: 10px; border-top-width: 2px; border-left-width: 2px; }
      .tr { top: 10px; right: 10px; border-top-width: 2px; border-right-width: 2px; }
      .bl { bottom: 10px; left: 10px; border-bottom-width: 2px; border-left-width: 2px; }
      .br { bottom: 10px; right: 10px; border-bottom-width: 2px; border-right-width: 2px; }
      .gold-line { width: 70px; height: 1px; background: #c9a84c; margin: 10px auto; }
      .label { color: #c9a84c; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase;
                font-family: 'Inter', sans-serif; font-weight: 600; }
      .section { text-align: center; margin-bottom: 16px; }
      .crest { width: 72px; height: 72px; object-fit: contain; display: inline-block; }
      .details-box { background: rgba(0,0,0,0.25); border-radius: 8px; padding: 14px 18px; margin: 12px 0; }
      .detail-row { display: flex; gap: 12px; margin-bottom: 8px; align-items: baseline; }
      .detail-key { color: #c9a84c; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase;
                    font-family: 'Inter', sans-serif; font-weight: 600; min-width: 38px; }
      .detail-val { color: #f5ede0; font-size: 12px; font-weight: 500; }
      .zone-grid { display: grid; grid-template-columns: 1fr 1fr; padding-top: 10px;
                   border-top: 1px solid rgba(201,168,76,0.2); margin-top: 6px; }
      .qr-wrap { text-align: center; margin: 12px 0 6px; }
      .qr-inner { background: #fff; padding: 8px; border-radius: 8px; border: 2px solid #c9a84c; display: inline-block; }
      .footer-note { text-align: center; color: rgba(245,237,224,0.3); font-size: 8px;
                     margin-top: 16px; font-style: italic; line-height: 1.6; font-family: 'Inter', sans-serif; }
    </style>
    </head><body>
    <div class="card">
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>

      <div class="section">
        <img class="crest" src="https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/d9072c6be_atuwatseiii.png" alt="Royal Crest" />
      </div>

      <div class="section">
        <p class="label">His Majesty</p>
        <h2 style="font-size:18px;font-weight:700;color:#f5ede0;letter-spacing:0.04em;line-height:1.2;margin:4px 0 2px;">Ògíame Atúwàtse III, CFR,</h2>
        <p style="color:#c9a84c;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">The Olu of Warri,</p>
        <div class="gold-line"></div>
        <p style="color:rgba(245,237,224,0.73);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:10px 0;font-style:italic;">Formally Invites</p>
        <div class="gold-line"></div>
      </div>

      <div class="section">
        <p style="font-size:22px;font-weight:700;color:#f5ede0;line-height:1.25;">${guestName}</p>
        ${guest.official_title ? `<p style="color:rgba(201,168,76,0.8);font-size:12px;margin-top:6px;font-style:italic;">${guest.official_title}</p>` : ""}
      </div>

      <div class="gold-line"></div>

      <div class="section" style="margin-top:14px;">
        <p style="color:rgba(245,237,224,0.73);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;font-style:italic;">To the</p>
        <h3 style="font-size:17px;font-weight:700;color:#c9a84c;letter-spacing:0.06em;text-transform:uppercase;line-height:1.3;">
          ${settings?.event_name || "5th Coronation Anniversary"}
        </h3>
        ${settings?.event_subtitle ? `<p style="color:rgba(245,237,224,0.4);font-size:10px;margin-top:4px;letter-spacing:0.1em;">${settings.event_subtitle}</p>` : ""}
      </div>

      <div class="gold-line"></div>

      <div class="details-box">
        <div class="detail-row"><span class="detail-key">Date</span><span class="detail-val">${formatEventDate(settings?.event_date)}</span></div>
        <div class="detail-row"><span class="detail-key">Venue</span><span class="detail-val">${venue}</span></div>
        <div class="detail-row" style="margin-bottom:0"><span class="detail-key">Time</span><span class="detail-val">${settings?.event_time || "TBC"}</span></div>
        <div class="zone-grid">
          <div><p class="label" style="margin-bottom:2px;">Category</p><p style="color:#f5ede0;font-size:11px;font-weight:600;">${guest.category || "—"}</p></div>
          <div><p class="label" style="margin-bottom:2px;">Seating Zone</p><p style="color:#f5ede0;font-size:11px;font-weight:600;">${guest.seating_zone || "To be assigned"}</p></div>
        </div>
      </div>

      <div class="qr-wrap">
        <div class="qr-inner"><img src="${qrImgUrl}" alt="QR Code" style="width:110px;height:110px;display:block;" /></div>
        <p class="label" style="margin-top:6px;">Scan to view invitation</p>
        <p style="color:#c9a84c;font-size:10px;font-family:monospace;font-weight:700;letter-spacing:0.2em;margin-top:3px;">${guest.qr_code}</p>
      </div>

      <p class="footer-note">This invitation is non-transferable. Please present upon arrival at the security checkpoint.</p>
    </div>
    </body></html>
  `;
}

export default function InviteDetailPrintSidebar({ guest, settings, open, onClose }) {
  if (!open) return null;

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(buildPrintHTML(guest, settings));
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 900);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Sidebar */}
      <div className="relative ml-auto w-80 bg-[#1a0a06] border-l border-[#c9a84c]/30 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c9a84c]/20">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#c9a84c]" />
            <span className="font-heading text-[#c9a84c] text-lg font-semibold">Printing</span>
          </div>
          <button onClick={onClose} className="text-[#f5ede0]/50 hover:text-[#f5ede0] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          {/* Guest summary */}
          <div className="bg-[#2a110a]/60 border border-[#c9a84c]/20 rounded-lg p-4">
            <p className="text-[#c9a84c] text-[9px] uppercase tracking-[0.3em] font-semibold mb-2">Guest</p>
            <p className="text-[#f5ede0] font-heading text-base font-semibold leading-snug">
              {[guest?.formal_salutation, guest?.full_name].filter(Boolean).join(" ")}
              {guest?.post_nominals ? `, ${guest.post_nominals}` : ""}
            </p>
            {guest?.official_title && (
              <p className="text-[#c9a84c]/70 text-xs mt-1 italic">{guest.official_title}</p>
            )}
            <p className="text-[#f5ede0]/40 text-[10px] mt-2 uppercase tracking-wider">{guest?.category}</p>
          </div>

          {/* Print options info */}
          <div className="bg-[#2a110a]/40 border border-[#c9a84c]/10 rounded-lg p-4 space-y-3">
            <p className="text-[#c9a84c] text-[9px] uppercase tracking-[0.3em] font-semibold">Print Settings</p>
            <div className="space-y-2 text-[#f5ede0]/70 text-xs">
              <div className="flex justify-between">
                <span>Format</span>
                <span className="text-[#f5ede0]">A5 Portrait</span>
              </div>
              <div className="flex justify-between">
                <span>Color Mode</span>
                <span className="text-[#f5ede0]">Full Color</span>
              </div>
              <div className="flex justify-between">
                <span>Background</span>
                <span className="text-[#f5ede0]">Included</span>
              </div>
              <div className="flex justify-between">
                <span>QR Code</span>
                <span className="text-[#f5ede0]">Included</span>
              </div>
            </div>
            <p className="text-[#f5ede0]/30 text-[10px] italic leading-relaxed border-t border-[#c9a84c]/10 pt-3">
              Ensure "Background graphics" is enabled in your browser's print dialog for best results.
            </p>
          </div>

          {/* What's included */}
          <div className="space-y-2">
            <p className="text-[#c9a84c] text-[9px] uppercase tracking-[0.3em] font-semibold">Included on Card</p>
            {[
              "Royal Crest & Header",
              "Guest Name & Title",
              "Event Name & Date",
              "Venue & Time",
              "Category & Seating Zone",
              "Unique QR Admission Code",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[#f5ede0]/70 text-xs">
                <div className="w-1 h-1 rounded-full bg-[#c9a84c] shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer action */}
        <div className="px-5 py-5 border-t border-[#c9a84c]/20 space-y-3">
          <Button
            onClick={handlePrint}
            className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-[#1a0a06] font-semibold"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invitation Card
          </Button>
          <p className="text-[#f5ede0]/30 text-[10px] text-center italic">
            Opens print dialog in a new window
          </p>
        </div>
      </div>
    </div>
  );
}