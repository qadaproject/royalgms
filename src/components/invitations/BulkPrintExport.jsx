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

function buildPrintHTML(selected, invitations, guests) {
  const guestMap = Object.fromEntries(guests.map((g) => [g.id, g]));

  const cards = selected.map((inv) => {
    const g = guestMap[inv.guest_id] || {};
    const salutation = g.formal_salutation ? `${g.formal_salutation} ` : "";
    const postNominals = g.post_nominals ? `, ${g.post_nominals}` : "";
    const tierLabel = inv.tier || "";
    const isGold = tierLabel.includes("Gold");
    const isWax = tierLabel.includes("Wax");

    const accentColor = isGold ? "#c9a84c" : isWax ? "#7c3aed" : "#0ea5e9";
    const tierText = isGold ? "TIER I — GOLD FOIL INVITATION" : isWax ? "TIER II — WAX SEAL INVITATION" : "TIER III — DIGITAL INVITATION";

    return `
    <div class="card" style="border-top:4px solid ${accentColor};">
      <div class="card-header" style="color:${accentColor};">${tierText}</div>
      <div class="emblem">♛</div>
      <div class="event-title">5th Coronation Anniversary</div>
      <div class="event-subtitle">Ogiame Atuwatse III · Olu of Warri Kingdom</div>
      <div class="divider" style="background:${accentColor};"></div>
      <div class="guest-name">${salutation}${g.full_name || inv.guest_name}${postNominals}</div>
      ${g.official_title ? `<div class="guest-title">${g.official_title}</div>` : ""}
      <div class="details-grid">
        <div class="detail-item"><span class="detail-label">Category</span><span class="detail-value">${inv.guest_category || g.category || "—"}</span></div>
        <div class="detail-item"><span class="detail-label">Zone</span><span class="detail-value">${g.seating_zone || "—"}</span></div>
        <div class="detail-item"><span class="detail-label">Dispatch</span><span class="detail-value">${inv.dispatch_type || "—"}</span></div>
        <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${inv.delivery_status || "Pending"}</span></div>
        ${inv.tracking_number ? `<div class="detail-item"><span class="detail-label">Tracking</span><span class="detail-value">${inv.tracking_number}</span></div>` : ""}
        ${inv.courier_name ? `<div class="detail-item"><span class="detail-label">Courier</span><span class="detail-value">${inv.courier_name}</span></div>` : ""}
      </div>
      ${g.qr_code ? `
      <div class="qr-section">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(g.qr_code)}" class="qr-img" alt="QR" />
        <div class="qr-code-text">${g.qr_code}</div>
      </div>` : ""}
      <div class="footer-note">This is an official invitation document. Present upon arrival.</div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><title>Invitation Dispatch Documents</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Georgia', serif; background: #f5f0e8; }
    .card { width: 680px; margin: 24px auto; background: #fff; padding: 40px 48px; border-radius: 6px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.12); page-break-after: always; }
    .card-header { font-size: 10px; font-family: sans-serif; letter-spacing: 0.18em; font-weight: 700;
      text-transform: uppercase; text-align: center; margin-bottom: 20px; }
    .emblem { font-size: 36px; text-align: center; margin-bottom: 8px; opacity: 0.7; }
    .event-title { font-size: 26px; font-weight: 700; text-align: center; color: #1a1a1a; letter-spacing: 0.04em; }
    .event-subtitle { font-size: 13px; text-align: center; color: #666; margin-top: 4px; letter-spacing: 0.06em; }
    .divider { height: 2px; width: 80px; margin: 20px auto; border-radius: 1px; }
    .guest-name { font-size: 22px; font-weight: 700; text-align: center; color: #1a1a1a; }
    .guest-title { font-size: 12px; text-align: center; color: #555; margin-top: 6px; font-style: italic; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; margin-top: 24px;
      background: #faf8f4; border-radius: 4px; padding: 16px; border: 1px solid #e8e0d0; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .detail-label { font-size: 9px; font-family: sans-serif; letter-spacing: 0.12em; text-transform: uppercase;
      color: #999; font-weight: 600; }
    .detail-value { font-size: 13px; color: #1a1a1a; font-weight: 500; }
    .qr-section { display: flex; flex-direction: column; align-items: center; margin-top: 20px; gap: 6px; }
    .qr-img { width: 80px; height: 80px; }
    .qr-code-text { font-family: monospace; font-size: 11px; color: #888; letter-spacing: 0.1em; }
    .footer-note { text-align: center; font-size: 10px; font-family: sans-serif; color: #bbb;
      margin-top: 24px; letter-spacing: 0.06em; border-top: 1px solid #eee; padding-top: 14px; }
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