import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SeatingPDFExport({ zones, guests }) {
  const [generating, setGenerating] = useState(false);

  const handleExport = () => {
    setGenerating(true);

    const rows = zones.map((zone) => {
      const assigned = guests.filter((g) => g.seating_zone === zone.name);
      const accepted = assigned.filter((g) => g.rsvp_status === "Accepted");
      const pct = zone.capacity ? Math.round((assigned.length / zone.capacity) * 100) : 0;

      const guestRows = assigned.length
        ? assigned
            .map(
              (g, i) => `
          <tr style="background:${i % 2 === 0 ? "#fffdf8" : "#fff"}">
            <td style="padding:6px 10px;border-bottom:1px solid #e8dfc8;font-size:12px">${g.formal_salutation || ""} ${g.full_name}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e8dfc8;font-size:11px;color:#6b5a3e">${g.official_title || "—"}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e8dfc8;font-size:11px">${g.category || "—"}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e8dfc8;font-size:11px;text-align:center">
              <span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:${
                g.rsvp_status === "Accepted" ? "#d1fae5" : g.rsvp_status === "Declined" ? "#fee2e2" : "#fef3c7"
              };color:${
                g.rsvp_status === "Accepted" ? "#065f46" : g.rsvp_status === "Declined" ? "#991b1b" : "#92400e"
              }">${g.rsvp_status}</span>
            </td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="4" style="padding:10px;text-align:center;color:#aaa;font-style:italic;font-size:12px">No guests assigned</td></tr>`;

      return `
        <div style="margin-bottom:28px;break-inside:avoid">
          <div style="display:flex;align-items:center;justify-content:space-between;background:#3d1a0a;color:#f5e6c8;padding:10px 14px;border-radius:6px 6px 0 0">
            <span style="font-size:14px;font-weight:700;letter-spacing:0.04em">${zone.name}</span>
            <span style="font-size:12px;opacity:0.85">${assigned.length} / ${zone.capacity} &nbsp;·&nbsp; ${pct}% capacity</span>
          </div>
          ${zone.description ? `<div style="background:#fdf7ee;padding:6px 14px;font-size:11px;color:#7a5c3a;border:1px solid #e8dfc8;border-top:none">${zone.description}</div>` : ""}
          <table style="width:100%;border-collapse:collapse;border:1px solid #e8dfc8;border-top:none">
            <thead>
              <tr style="background:#f5e6c8">
                <th style="padding:7px 10px;text-align:left;font-size:11px;color:#5a3a1a;font-weight:600;border-bottom:1px solid #d4b896">Guest</th>
                <th style="padding:7px 10px;text-align:left;font-size:11px;color:#5a3a1a;font-weight:600;border-bottom:1px solid #d4b896">Title</th>
                <th style="padding:7px 10px;text-align:left;font-size:11px;color:#5a3a1a;font-weight:600;border-bottom:1px solid #d4b896">Category</th>
                <th style="padding:7px 10px;text-align:center;font-size:11px;color:#5a3a1a;font-weight:600;border-bottom:1px solid #d4b896">RSVP</th>
              </tr>
            </thead>
            <tbody>${guestRows}</tbody>
          </table>
          ${zone.special_notes ? `<div style="background:#fffbeb;padding:6px 14px;font-size:11px;color:#92400e;border:1px solid #e8dfc8;border-top:none">⚠ ${zone.special_notes}</div>` : ""}
        </div>`;
    });

    const unassigned = guests.filter((g) => !g.seating_zone && g.rsvp_status === "Accepted");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Seating Plan — Ògíame Atúwàtse III, CFR</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 28px 36px; background: #fff; color: #1a0e06; }
    h1 { font-family: 'Cormorant Garamond', serif; }
    @media print { body { padding: 16px 20px; } }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #c9a84c">
    <p style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8a6a3a;margin:0 0 6px">Royal Protocol Office</p>
    <h1 style="font-size:26px;font-weight:700;margin:0;color:#3d1a0a">Seating Floor Plan</h1>
    <p style="font-size:13px;color:#7a5c3a;margin:6px 0 0">5th Coronation Anniversary · Ògíame Atúwàtse III, CFR</p>
    <p style="font-size:11px;color:#aaa;margin:4px 0 0">Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:24px">
    <div style="background:#f5e6c8;padding:10px 14px;border-radius:6px;text-align:center">
      <p style="font-size:22px;font-weight:700;margin:0;color:#3d1a0a">${zones.length}</p>
      <p style="font-size:10px;color:#7a5c3a;margin:2px 0 0;text-transform:uppercase;letter-spacing:0.1em">Zones</p>
    </div>
    <div style="background:#f5e6c8;padding:10px 14px;border-radius:6px;text-align:center">
      <p style="font-size:22px;font-weight:700;margin:0;color:#3d1a0a">${guests.filter((g) => g.seating_zone).length}</p>
      <p style="font-size:10px;color:#7a5c3a;margin:2px 0 0;text-transform:uppercase;letter-spacing:0.1em">Assigned</p>
    </div>
    <div style="background:#fef3c7;padding:10px 14px;border-radius:6px;text-align:center">
      <p style="font-size:22px;font-weight:700;margin:0;color:#92400e">${unassigned.length}</p>
      <p style="font-size:10px;color:#92400e;margin:2px 0 0;text-transform:uppercase;letter-spacing:0.1em">Unassigned</p>
    </div>
  </div>

  ${rows.join("")}

  ${
    unassigned.length > 0
      ? `<div style="margin-top:12px;break-inside:avoid">
    <div style="background:#92400e;color:#fff;padding:10px 14px;border-radius:6px 6px 0 0">
      <span style="font-size:14px;font-weight:700">Waitlist — Unassigned Accepted Guests (${unassigned.length})</span>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e8dfc8;border-top:none">
      <thead><tr style="background:#fef3c7">
        <th style="padding:7px 10px;text-align:left;font-size:11px;color:#92400e;font-weight:600">Guest</th>
        <th style="padding:7px 10px;text-align:left;font-size:11px;color:#92400e;font-weight:600">Category</th>
        <th style="padding:7px 10px;text-align:left;font-size:11px;color:#92400e;font-weight:600">Title</th>
      </tr></thead>
      <tbody>${unassigned
        .map(
          (g, i) => `<tr style="background:${i % 2 === 0 ? "#fffdf8" : "#fff"}">
        <td style="padding:6px 10px;font-size:12px;border-bottom:1px solid #e8dfc8">${g.formal_salutation || ""} ${g.full_name}</td>
        <td style="padding:6px 10px;font-size:11px;border-bottom:1px solid #e8dfc8;color:#6b5a3e">${g.category || "—"}</td>
        <td style="padding:6px 10px;font-size:11px;border-bottom:1px solid #e8dfc8;color:#6b5a3e">${g.official_title || "—"}</td>
      </tr>`
        )
        .join("")}</tbody>
    </table>
  </div>`
      : ""
  }

  <div style="margin-top:32px;padding-top:12px;border-top:1px solid #e8dfc8;text-align:center;font-size:10px;color:#aaa">
    Royal Protocol Office · Warri Kingdom · Confidential — For official use only
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); setGenerating(false); };
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={generating}>
      {generating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      Export PDF
    </Button>
  );
}