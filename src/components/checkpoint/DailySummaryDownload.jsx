import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/d9072c6be_atuwatseiii.png";

const CATEGORY_COLORS = {
  "A - Royal":      "#7a1c2e",
  "B - Federal":    "#1a3a6b",
  "C - State":      "#1a5c3a",
  "D - Corporate":  "#4a3000",
  "E - Diplomatic": "#4a1a6b",
  "F - Traditional":"#6b3a00",
  "G - General":    "#2a2a2a",
};

function buildSummaryHTML(checkedIn) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const byCategory = {};
  checkedIn.forEach((g) => {
    const cat = g.category || "G - General";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(g);
  });

  const sections = Object.entries(byCategory).sort().map(([cat, guests]) => {
    const color = CATEGORY_COLORS[cat] || "#2a2a2a";
    const rows = guests.map((g, i) => `
      <tr style="${i % 2 === 0 ? "background:#fafafa;" : ""}">
        <td style="padding:8px 12px; font-size:13px; color:#1a0a06;">${i + 1}</td>
        <td style="padding:8px 12px; font-size:13px; color:#1a0a06; font-weight:600;">${g.formal_salutation || ""} ${g.full_name}</td>
        <td style="padding:8px 12px; font-size:12px; color:#555; font-style:italic;">${g.official_title || "—"}</td>
        <td style="padding:8px 12px; font-size:12px; color:#555;">${g.seating_zone || "—"}</td>
        <td style="padding:8px 12px; font-size:11px; font-family:monospace; color:${color}; font-weight:700;">${g.qr_code || "—"}</td>
      </tr>`).join("");
    return `
      <div class="section">
        <div class="cat-header" style="background:${color}; color:#fff;">${cat} &nbsp;·&nbsp; ${guests.length} guest${guests.length !== 1 ? "s" : ""}</div>
        <table>
          <thead><tr>
            <th>#</th><th>Name</th><th>Title</th><th>Zone</th><th>Token</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><title>Daily Arrival Summary</title>
  <link href="https://fonts.cdnfonts.com/css/trajan-pro" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Georgia', serif; background:#fff; color:#1a0a06; }
    .page { width:900px; margin:0 auto; padding:40px 48px; }
    .header { display:flex; align-items:center; gap:20px; border-bottom:3px solid #c9a84c; padding-bottom:20px; margin-bottom:28px; }
    .header img { width:80px; height:80px; object-fit:contain; }
    .header-text h1 { font-family:'Trajan Pro',serif; font-size:22px; color:#7a1c2e; letter-spacing:0.06em; }
    .header-text p { font-size:12px; color:#888; margin-top:4px; letter-spacing:0.04em; }
    .summary-bar { display:flex; gap:20px; margin-bottom:28px; }
    .sum-box { flex:1; background:#f9f6ee; border:1px solid #c9a84c33; border-radius:6px; padding:16px; text-align:center; }
    .sum-num { font-size:28px; font-weight:700; color:#7a1c2e; font-family:'Trajan Pro',serif; }
    .sum-label { font-size:9px; text-transform:uppercase; letter-spacing:0.15em; color:#888; margin-top:4px; }
    .section { margin-bottom:24px; }
    .cat-header { font-family:'Trajan Pro',serif; font-size:11px; letter-spacing:0.12em; text-transform:uppercase;
      padding:8px 14px; border-radius:4px 4px 0 0; }
    table { width:100%; border-collapse:collapse; border:1px solid #eee; }
    thead { background:#f5f0e8; }
    th { padding:8px 12px; font-size:9px; text-transform:uppercase; letter-spacing:0.12em; text-align:left; color:#888; font-family:'Trajan Pro',serif; }
    td { border-bottom:1px solid #f0ece4; }
    .footer { text-align:center; font-size:10px; color:#bbb; margin-top:32px; padding-top:16px; border-top:1px solid #eee; letter-spacing:0.05em; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
  </head><body><div class="page">
    <div class="header">
      <img src="${LOGO_URL}" alt="Royal Crest" />
      <div class="header-text">
        <h1>Daily Arrival Summary Report</h1>
        <p>Generated: ${dateStr} at ${timeStr} &nbsp;·&nbsp; Royal Protocol Management System</p>
        <p style="margin-top:3px;">5th Coronation Anniversary — Ogiame Atuwatse III</p>
      </div>
    </div>
    <div class="summary-bar">
      <div class="sum-box"><div class="sum-num">${checkedIn.length}</div><div class="sum-label">Total Arrived</div></div>
      ${Object.entries(byCategory).sort().map(([cat, gs]) =>
        `<div class="sum-box"><div class="sum-num" style="font-size:20px;">${gs.length}</div><div class="sum-label">${cat.split(" - ")[1] || cat}</div></div>`
      ).join("")}
    </div>
    ${sections}
    <div class="footer">Royal Protocol Management System &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; ${new Date().getFullYear()}</div>
  </div></body></html>`;
}

export default function DailySummaryDownload({ guests }) {
  const [loading, setLoading] = useState(false);

  const checkedIn = guests.filter((g) => g.rsvp_status === "Accepted");

  const handleDownload = () => {
    setLoading(true);
    const html = buildSummaryHTML(checkedIn);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.print();
      setLoading(false);
    };
  };

  return (
    <Button onClick={handleDownload} disabled={loading || checkedIn.length === 0} className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0604] gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Daily Summary ({checkedIn.length})
    </Button>
  );
}