import { format } from "date-fns";

export function formatEventDate(dateStr) {
  if (!dateStr) return "TBC";
  try { return format(new Date(dateStr), "EEEE MMMM d, yyyy"); }
  catch { return dateStr; }
}

export function buildPrintHTML(guest, settings) {
  const qrUrl = `${window.location.origin}/invite-detail?token=${guest.qr_code}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
  const guestName = [guest.formal_salutation, guest.full_name, guest.post_nominals || null].filter(Boolean).join(" ");
  const venue = [settings?.venue_name, settings?.venue_address].filter(Boolean).join(", ") || "TBC";

  return `
    <html><head>
    <title>${guest.full_name.replace(/\s+/g, '_')}_${guest.qr_code}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @page { size: A5 portrait; margin: 4mm; }
      body { background: #1a0a06; print-color-adjust: exact; -webkit-print-color-adjust: exact;
             display: flex; justify-content: center; align-items: flex-start;
             min-height: 100vh; font-family: 'Cormorant Garamond', Georgia, serif; }
      @media print { body { background: #1a0a06; } }
      .card {
        background: linear-gradient(135deg, #3d0a06 0%, #6b1a12 50%, #3d0a06 100%);
        border: 3px solid #c9a84c; border-radius: 12px; padding: 20px;
        color: #f5ede0; width: 100%; max-width: 420px; position: relative;
      }
      .corner { position: absolute; width: 22px; height: 22px; border-color: #c9a84c; border-style: solid; border-width: 0; }
      .tl { top: 10px; left: 10px; border-top-width: 2px; border-left-width: 2px; }
      .tr { top: 10px; right: 10px; border-top-width: 2px; border-right-width: 2px; }
      .bl { bottom: 10px; left: 10px; border-bottom-width: 2px; border-left-width: 2px; }
      .br { bottom: 10px; right: 10px; border-bottom-width: 2px; border-right-width: 2px; }
      .gold-line { width: 70px; height: 1px; background: #c9a84c; margin: 6px auto; }
      .label { color: #c9a84c; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase;
                font-family: 'Inter', sans-serif; font-weight: 600; }
      .section { text-align: center; margin-bottom: 10px; }
      .crest { width: 58px; height: 58px; object-fit: contain; display: inline-block; }
      .details-box { background: rgba(0,0,0,0.25); border-radius: 8px; padding: 10px 14px; margin: 8px 0; }
      .detail-row { display: flex; gap: 12px; margin-bottom: 5px; align-items: baseline; }
      .detail-key { color: #c9a84c; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase;
                    font-family: 'Inter', sans-serif; font-weight: 600; min-width: 38px; }
      .detail-val { color: #f5ede0; font-size: 12px; font-weight: 500; }
      .zone-grid { display: grid; grid-template-columns: 1fr 1fr; padding-top: 7px;
                   border-top: 1px solid rgba(201,168,76,0.2); margin-top: 4px; }
      .qr-wrap { text-align: center; margin: 8px 0 4px; }
      .qr-inner { background: #fff; padding: 6px; border-radius: 8px; border: 2px solid #c9a84c; display: inline-block; }
      .footer-note { text-align: center; color: rgba(245,237,224,0.3); font-size: 8px;
                     margin-top: 8px; font-style: italic; line-height: 1.6; font-family: 'Inter', sans-serif; }
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
        <p style="color:rgba(245,237,224,0.73);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:6px 0;font-style:italic;">Formally Invites</p>
        <div class="gold-line"></div>
      </div>

      <div class="section">
        <p style="font-size:22px;font-weight:700;color:#f5ede0;line-height:1.25;">${guestName}</p>
        ${guest.official_title ? `<p style="color:rgba(201,168,76,0.8);font-size:12px;margin-top:6px;font-style:italic;">${guest.official_title}</p>` : ""}
      </div>

      <div class="gold-line"></div>

      <div class="section" style="margin-top:8px;">
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
        <div class="qr-inner"><img src="${qrImgUrl}" alt="QR Code" style="width:90px;height:90px;display:block;" /></div>
        <p class="label" style="margin-top:6px;">Scan to view invitation</p>
        <p style="color:#c9a84c;font-size:10px;font-family:monospace;font-weight:700;letter-spacing:0.2em;margin-top:3px;">${guest.qr_code}</p>
      </div>

      <p class="footer-note">This invitation is non-transferable. Please present upon arrival at the security checkpoint.</p>
    </div>
    </body></html>
  `;
}