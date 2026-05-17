import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Tag } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/d9072c6be_atuwatseiii.png";

const CATEGORY_COLORS = {
  "A - Royal":      { accent: "#7a1c2e", light: "#fdf0f2" },
  "B - Federal":    { accent: "#1a3a6b", light: "#f0f3f9" },
  "C - State":      { accent: "#1a5c3a", light: "#f0f7f3" },
  "D - Corporate":  { accent: "#4a3000", light: "#faf6ee" },
  "E - Diplomatic": { accent: "#4a1a6b", light: "#f5f0f9" },
  "F - Traditional":{ accent: "#6b3a00", light: "#fdf5ee" },
  "G - General":    { accent: "#2a2a2a", light: "#f8f8f8" },
};

function buildNameTagHTML(selectedGuests) {
  const tags = selectedGuests.map((g) => {
    const colors = CATEGORY_COLORS[g.category] || CATEGORY_COLORS["G - General"];
    const seatLabel = [g.seating_zone, g.seat_number].filter(Boolean).join(" · ");
    return `
    <div class="tag" style="border-top:5px solid ${colors.accent}; background:${colors.light};">
      <div class="tag-header" style="color:${colors.accent};">
        <img src="${LOGO_URL}" class="tag-logo" alt="Crest" />
        <span>5th Coronation Anniversary</span>
      </div>
      <div style="width:60px;height:1px;background:${colors.accent}40;margin:0 auto 8px;"></div>
      <div class="tag-salutation" style="color:${colors.accent};">${g.formal_salutation || ""}</div>
      <div class="tag-name">${g.full_name}</div>
      ${g.post_nominals ? `<div class="tag-nominals" style="color:${colors.accent};">${g.post_nominals}</div>` : ""}
      ${g.official_title ? `<div class="tag-title">${g.official_title}</div>` : ""}
      <div style="width:60px;height:1px;background:${colors.accent}40;margin:6px auto;"></div>
      <div class="tag-category" style="color:${colors.accent}; border:1px solid ${colors.accent}40;">${g.category || ""}</div>
      ${seatLabel ? `<div class="tag-zone" style="background:${colors.accent}; color:#fff;">${seatLabel}</div>` : ""}
      ${g.qr_code ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(g.qr_code)}" class="tag-qr" alt="QR" />` : ""}
    </div>`;
  }).join("");

  return `<!DOCTYPE html><html><head><title>Name Tags</title>
  <link href="https://fonts.cdnfonts.com/css/trajan-pro" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Georgia', serif; background:#f5f0e8; }
    .grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; padding:24px; }
    .tag { border-radius:8px; padding:16px 18px; display:flex; flex-direction:column; align-items:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.10); page-break-inside:avoid; min-height:200px; }
    .tag-header { display:flex; align-items:center; gap:8px; font-size:8px; letter-spacing:0.18em;
      text-transform:uppercase; font-weight:700; margin-bottom:8px; font-family:'Trajan Pro',serif; }
    .tag-logo { width:28px; height:28px; object-fit:contain; }
    .tag-salutation { font-size:11px; color:#555; margin-bottom:2px; letter-spacing:0.05em; }
    .tag-name { font-size:20px; font-weight:700; text-align:center; letter-spacing:0.02em;
      font-family:'Trajan Pro',serif; color:#1a0a06; margin:2px 0; }
    .tag-nominals { font-size:10px; font-weight:700; letter-spacing:0.12em; margin-bottom:4px; }
    .tag-title { font-size:11px; color:#666; font-style:italic; text-align:center; margin-bottom:4px; }
    .tag-category { font-size:9px; letter-spacing:0.12em; text-transform:uppercase; font-weight:700;
      padding:2px 10px; border-radius:10px; margin-bottom:4px; }
    .tag-zone { font-size:9px; letter-spacing:0.12em; text-transform:uppercase; font-weight:700;
      padding:3px 10px; border-radius:12px; margin-top:4px; margin-bottom:6px; }
    .tag-qr { width:50px; height:50px; margin-top:6px; }
    @media print {
      body { background:white; }
      .grid { gap:8px; padding:12px; }
      .tag { box-shadow:none; border:1px solid #ddd; }
    }
  </style></head><body><div class="grid">${tags}</div></body></html>`;
}

export default function NameTagPrint({ open, onOpenChange, guests }) {
  const [selected, setSelected] = useState(new Set());

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const selectAll = () => setSelected(new Set(guests.map((g) => g.id)));
  const clearAll = () => setSelected(new Set());

  const handlePrint = () => {
    const chosen = guests.filter((g) => selected.has(g.id));
    if (!chosen.length) return;
    const html = buildNameTagHTML(chosen);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent" /> Print Name Tags
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Select guests to generate printable name tags (3 per row)</p>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2 border-b border-border">
          <button onClick={selectAll} className="text-xs text-primary hover:underline">Select all ({guests.length})</button>
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:underline">Clear</button>
          <span className="ml-auto text-xs text-muted-foreground">{selected.size} selected</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {guests.map((g) => (
            <label key={g.id} className="flex items-center gap-3 py-2.5 px-1 cursor-pointer hover:bg-muted/30 transition-colors">
              <Checkbox checked={selected.has(g.id)} onCheckedChange={() => toggle(g.id)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{g.formal_salutation} {g.full_name}</p>
                <p className="text-[10px] text-muted-foreground">{g.category} {g.official_title ? `· ${g.official_title}` : ""}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${g.rsvp_status === "Accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{g.rsvp_status}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePrint} disabled={selected.size === 0} className="gap-2">
            <Printer className="w-4 h-4" />
            Print {selected.size > 0 ? selected.size : ""} Tag{selected.size !== 1 ? "s" : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}