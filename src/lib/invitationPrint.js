import { format } from "date-fns";

export function formatEventDate(dateStr) {
  if (!dateStr) return "TBC";
  try { return format(new Date(dateStr), "EEEE MMMM d, yyyy"); }
  catch { return dateStr; }
}

export function buildPrintHTML(guest, settings) {
  const qrUrl = `${window.location.origin}/invite-detail?token=${guest.qr_code}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
  const guestName = [guest.formal_salutation, guest.full_name, guest.post_nominals ? `, ${guest.post_nominals}` : ""].filter(Boolean).join(" ");
  const venue = [settings?.venue_name, settings?.venue_address].filter(Boolean).join(", ") || "TBC";

  return `
    <html><head>
    <title>${guest.full_name.replace(/\./g, '').replace(/\s+/g, '_')}_${guest.qr_code}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @page { size: A4 portrait; margin: 6mm; }
      body { background: #1a0a06; print-color-adjust: exact; -webkit-print-color-adjust: exact;
             display: flex; justify-content: center; align-items: flex-start;
             min-height: 100vh; font-family: 'Cormorant Garamond', Georgia, serif; }
      @media print { body { background: #1a0a06; } }
      .card {
        background: radial-gradient(ellipse at 50% 30%, #6b1a12 0%, #3d0a06 40%, #4a0808 100%);
        border: 2px solid #c9a84c; border-radius: 16px; padding: 40px;
        color: #f5ede0; width: 100%; max-width: 448px; position: relative;
      }
      .corner { position: absolute; width: 32px; height: 32px; border-color: #c9a84c; border-style: solid; border-width: 0; }
      .tl { top: 12px; left: 12px; border-top-width: 2px; border-left-width: 2px; border-top-left-radius: 4px; }
      .tr { top: 12px; right: 12px; border-top-width: 2px; border-right-width: 2px; border-top-right-radius: 4px; }
      .bl { bottom: 12px; left: 12px; border-bottom-width: 2px; border-left-width: 2px; border-bottom-left-radius: 4px; }
      .br { bottom: 12px; right: 12px; border-bottom-width: 2px; border-right-width: 2px; border-bottom-right-radius: 4px; }
      .section { text-align: center; }
      .crest { width: 72px; height: 72px; object-fit: contain; display: inline-block; }
      .divider { display: flex; align-items: center; gap: 12px; justify-content: center; margin: 20px 0; }
      .divider-line { flex: 1; height: 1px; background: rgba(201,168,76,0.3); max-width: 60px; }
      .divider-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(201,168,76,0.5); }
      .details-box { background: rgba(0,0,0,0.25); border: 1px solid rgba(201,168,76,0.2); border-radius: 8px; overflow: hidden; }
      .detail-row { display: flex; gap: 16px; padding: 10px 20px; align-items: flex-start; }
      .detail-row-sep { border-bottom: 1px solid rgba(201,168,76,0.1); }
      .detail-key { color: #c9a84c; font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
                    text-transform: uppercase; font-family: 'Inter', sans-serif; min-width: 48px; }
      .detail-val { color: #f5ede0; font-size: 14px; }
      .zone-row { border-top: 1px solid rgba(201,168,76,0.2); padding: 12px 20px; display: flex; align-items: baseline; gap: 12px; }
      .zone-label { color: #c9a84c; font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
                    text-transform: uppercase; font-family: 'Inter', sans-serif; margin-bottom: 4px; }
      .zone-val { color: #f5ede0; font-size: 14px; }
      .qr-wrap { text-align: center; margin: 12px 0 0; }
      .qr-inner { background: #fff; padding: 12px; border-radius: 12px; display: inline-block; }
      .footer-note { text-align: center; color: rgba(245,237,224,0.3); font-size: 10px;
                     margin-top: 24px; font-style: italic; font-family: 'Inter', sans-serif; }
    </style>
    </head><body>
    <div class="card">
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>

      <div class="section" style="margin-bottom:16px;">
        <img class="crest" src="https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/d9072c6be_atuwatseiii.png" alt="Royal Crest" />
      </div>

      <div class="section">
        <p style="color:#c9a84c;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;margin-bottom:4px;font-family:'Inter',sans-serif;font-weight:600;">His Majesty</p>
        <p style="font-size:20px;font-weight:600;color:#f5ede0;line-height:1.3;font-family:'Cormorant Garamond',serif;letter-spacing:0.02em;">Ògíame Atúwàtse III, CFR,</p>
        <p style="color:#c9a84c;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:16px;font-family:'Inter',sans-serif;">The Olu of Warri,</p>
        <p style="color:rgba(245,237,224,0.7);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:20px;font-style:italic;">Formally Invites</p>
      </div>

      <div class="section" style="margin-bottom:4px;">
        <p style="font-size:24px;font-weight:700;color:#f5ede0;line-height:1.25;font-family:'Cormorant Garamond',serif;">${guestName}</p>
        ${guest.official_title ? `<p style="color:rgba(201,168,76,0.8);font-size:14px;margin-top:4px;font-style:italic;">${guest.official_title}</p>` : ""}
        ${guest.honour_status === "Special Guest of Honour" ? `<p style="color:#f5ede0;font-size:14px;margin-top:4px;"><span style="font-style:italic;">as</span> <span style="font-weight:600;">Special Guest of Honour</span></p>` : ""}
      </div>

      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-dot"></div>
        <div class="divider-line"></div>
      </div>

      <div class="section">
        <p style="color:rgba(201,168,76,0.7);font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:4px;font-family:'Inter',sans-serif;font-weight:600;">To The</p>
        <p style="font-size:24px;font-weight:700;color:#c9a84c;letter-spacing:0.05em;text-transform:uppercase;line-height:1.3;font-family:'Cormorant Garamond',serif;">
          ${settings?.event_name || "5th Coronation Anniversary"}
        </p>
        <p style="color:rgba(201,168,76,0.7);font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin-top:4px;margin-bottom:4px;font-family:'Inter',sans-serif;font-weight:600;">Of</p>
        <p style="color:rgba(245,237,224,0.5);font-size:12px;margin-bottom:24px;">
          ${settings?.event_subtitle || "Ogiame Atuwatse III, Olu of Warri Kingdom"}
        </p>
      </div>

      <div class="details-box">
        <div class="detail-row detail-row-sep"><span class="detail-key">DATE</span><span class="detail-val">${formatEventDate(settings?.event_date)}</span></div>
        <div class="detail-row detail-row-sep"><span class="detail-key">VENUE</span><span class="detail-val">${venue}</span></div>
        <div class="detail-row"><span class="detail-key">TIME</span><span class="detail-val">${settings?.event_time || "TBC"}</span></div>
        <div class="zone-row">
          <p class="zone-label" style="flex-shrink:0;">Seating Zone</p>
          <p class="zone-val">${guest.seating_zone || "To be assigned"}</p>
        </div>
      </div>

      <div class="qr-wrap">
        <div class="qr-inner"><img src="${qrImgUrl}" alt="QR Code" style="width:144px;height:144px;display:block;" /></div>
      </div>
      <p style="color:rgba(245,237,224,0.4);font-size:9px;letter-spacing:0.3em;text-transform:uppercase;text-align:center;margin-top:12px;margin-bottom:4px;font-family:'Inter',sans-serif;font-weight:600;">Scan to View Invitation</p>
      <p style="color:#c9a84c;font-size:18px;font-family:monospace;font-weight:700;letter-spacing:0.3em;text-align:center;margin-bottom:24px;">${guest.qr_code}</p>

      <p class="footer-note">${settings?.footer_note || "This invitation is non-transferable. Please present upon arrival at the security checkpoint."}</p>
    </div>
    </body></html>
  `;
}