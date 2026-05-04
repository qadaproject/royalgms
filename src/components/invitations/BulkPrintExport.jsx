import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Printer, CheckSquare, Square, Crown } from "lucide-react";

const TIER_BADGE = {
  "Tier 1 - Gold Foil": "bg-accent/20 text-accent border-accent/30",
  "Tier 2 - Wax Seal": "bg-rose-500/10 text-rose-700 border-rose-500/20",
  "Tier 3 - Digital": "bg-blue-500/10 text-blue-700 border-blue-500/20",
};

// Category-based colour coding for invitations
const CATEGORY_COLORS = {
  "A - Royal":      { accent: "#7a1c2e", bg: "#f9f0f2", border: "#7a1c2e" },
  "B - Federal":    { accent: "#1a3a6b", bg: "#f0f3f9", border: "#1a3a6b" },
  "C - State":      { accent: "#1a5c3a", bg: "#f0f7f3", border: "#1a5c3a" },
  "D - Corporate":  { accent: "#4a3000", bg: "#faf6ee", border: "#c9a84c" },
  "E - Diplomatic": { accent: "#4a1a6b", bg: "#f5f0f9", border: "#4a1a6b" },
  "F - Traditional":{ accent: "#6b3a00", bg: "#fdf5ee", border: "#b87333" },
  "G - General":    { accent: "#2a2a2a", bg: "#f8f8f8", border: "#888888" },
};

const LOGO_URL = "https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/a46b1eb03_atuwatseiii.png";

function buildPrintHTML(selected, invitations, guests) {
  const guestMap = Object.fromEntries(guests.map((g) => [g.id, g]));

  const cards = selected.map((inv) => {
    const g = guestMap[inv.guest_id] || {};
    const salutation = g.formal_salutation ? `${g.formal_salutation} ` : "";
    const postNominals = g.post_nominals ? `, ${g.post_nominals}` : "";
    const cat = g.category || inv.guest_category || "G - General";
    const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["G - General"];

    return `
    <div class="card" style="border-top:5px solid ${colors.accent}; background:${colors.bg};">
      <div class="card-header" style="color:${colors.accent};">OFFICIAL INVITATION — ${cat}</div>
      <div class="logo-wrap">
        <img src="${LOGO_URL}" class="logo-img" alt="Royal Crest" />
      </div>
      <div class="event-title" style="color:${colors.accent};">5th Coronation Anniversary</div>
      <div class="event-subtitle">Ogiame Atuwatse III · Olu of Warri Kingdom</div>
      <div class="divider" style="background:${colors.accent};"></div>
      <div class="guest-name">${salutation}${g.full_name || inv.guest_name}${postNominals}</div>
      ${g.official_title ? `<div class="guest-title">${g.official_title}</div>` : ""}
      <div class="details-grid" style="border-color:${colors.border}30; background:${colors.accent}08;">
        <div class="detail-item"><span class="detail-label" style="color:${colors.accent}99;">Category</span><span class="detail-value">${cat}</span></div>
        <div class="detail-item"><span class="detail-label" style="color:${colors.accent}99;">Zone</span><span class="detail-value">${g.seating_zone || "—"}</span></div>
      </div>
      ${g.qr_code ? `
      <div class="qr-section">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(g.qr_code)}" class="qr-img" alt="QR" />
        <div class="qr-code-text">${g.qr_code}</div>
      </div>` : ""}
      <div class="footer-note" style="border-color:${colors.accent}20;">This is an official invitation document. Present upon arrival at the venue.</div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><title>Invitation Dispatch Documents</title>
  <link href="https://fonts.cdnfonts.com/css/trajan-pro" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Trajan Pro', 'Georgia', serif; background: #f5f0e8; }
    .card { width: 680px; margin: 24px auto; background: #fff; padding: 40px 48px; border-radius: 6px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.12); page-break-after: always; }
    .card-header { font-size: 9px; font-family: 'Trajan Pro', serif; letter-spacing: 0.22em; font-weight: 700;
      text-transform: uppercase; text-align: center; margin-bottom: 16px; }
    .logo-wrap { text-align: center; margin-bottom: 12px; }
    .logo-img { width: 110px; height: 110px; object-fit: contain; }
    .event-title { font-size: 24px; font-weight: 700; text-align: center; letter-spacing: 0.05em; font-family: 'Trajan Pro', serif; }
    .event-subtitle { font-size: 12px; text-align: center; color: #555; margin-top: 5px; letter-spacing: 0.08em; }
    .divider { height: 2px; width: 80px; margin: 18px auto; border-radius: 1px; }
    .guest-name { font-size: 21px; font-weight: 700; text-align: center; color: #1a1a1a; font-family: 'Trajan Pro', serif; }
    .guest-title { font-size: 12px; text-align: center; color: #555; margin-top: 6px; font-style: italic; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-top: 22px;
      border-radius: 4px; padding: 16px; border: 1px solid #ddd; }
    .detail-item { display: flex; flex-direction: column; gap: 3px; }
    .detail-label { font-size: 8px; font-family: 'Trajan Pro', sans-serif; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; }
    .detail-value { font-size: 13px; color: #1a1a1a; font-weight: 500; }
    .qr-section { display: flex; flex-direction: column; align-items: center; margin-top: 20px; gap: 6px; }
    .qr-img { width: 80px; height: 80px; }
    .qr-code-text { font-family: monospace; font-size: 11px; color: #888; letter-spacing: 0.1em; }
    .footer-note { text-align: center; font-size: 9px; font-family: 'Trajan Pro', serif; color: #aaa;
      margin-top: 22px; letter-spacing: 0.07em; border-top: 1px solid #eee; padding-top: 14px; }
    @media print { body { background: white; } .card { box-shadow: none; margin: 0 auto; page-break-after: always; } }
  </style>
  </head><body>${cards}</body></html>`;
}

export default function BulkPrintExport({ open, onOpenChange, invitations, guests }) {
  const [selected, setSelected] = useState(new Set());
  const [printing, setPrinting] = useState(false);

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const selectAll = () => setSelected(new Set(invitations.map((i) => i.id)));
  const clearAll = () => setSelected(new Set());

  const handlePrint = () => {
    const selectedInvitations = invitations.filter((i) => selected.has(i.id));
    if (!selectedInvitations.length) return;
    setPrinting(true);
    const html = buildPrintHTML(selectedInvitations, invitations, guests);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); setPrinting(false); };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Crown className="w-5 h-5 text-accent" />
            Bulk Print — Dispatch Documents
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Select invitations to print as formatted official documents</p>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={selectAll} className="text-xs text-primary flex items-center gap-1 hover:underline">
              <CheckSquare className="w-3.5 h-3.5" /> Select all
            </button>
            <button onClick={clearAll} className="text-xs text-muted-foreground flex items-center gap-1 hover:underline">
              <Square className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {invitations.map((inv) => (
            <label key={inv.id} className="flex items-center gap-3 py-2.5 px-1 cursor-pointer hover:bg-muted/30 transition-colors">
              <Checkbox
                checked={selected.has(inv.id)}
                onCheckedChange={() => toggle(inv.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{inv.guest_name}</span>
                  <Badge variant="outline" className={`text-[9px] border ${TIER_BADGE[inv.tier] || ""}`}>
                    {inv.tier?.replace("Tier ", "T").replace(" - ", " ")}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{inv.guest_category} · {inv.dispatch_type} · {inv.delivery_status}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handlePrint}
            disabled={selected.size === 0 || printing}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            {printing ? "Preparing..." : `Print ${selected.size || ""} Document${selected.size !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}