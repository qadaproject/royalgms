import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Printer, Crown, ScrollText, Star } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  { id: "coronation", label: "5th Coronation — Official", icon: Crown },
  { id: "formal", label: "Royal Protocol — Formal", icon: ScrollText },
  { id: "ceremonial", label: "Ceremonial Banquet", icon: Star },
];

function buildInvitationHTML(guest, invitation, template) {
  const tierLabel = invitation?.tier || "Tier 3 - Digital";
  const isGold = tierLabel.includes("Gold");
  const isWax = tierLabel.includes("Wax");

  const borderColor = isGold ? "#c9a84c" : isWax ? "#8b5cf6" : "#3b82f6";
  const accentColor = isGold ? "#c9a84c" : isWax ? "#8b5cf6" : "#3b82f6";

  const ceremonyDate = "Saturday, 12th July 2025";
  const venue = "Royal Palace Grounds, Warri, Delta State";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Royal Invitation — ${guest.full_name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; background: #fff; }
        .page {
          width: 800px; min-height: 1100px; margin: 0 auto;
          padding: 60px 70px;
          border: 3px solid ${borderColor};
          position: relative;
          background: linear-gradient(135deg, #fffdf8 0%, #faf6ee 100%);
        }
        .corner { position: absolute; width: 40px; height: 40px; border-color: ${borderColor}; border-style: solid; }
        .tl { top: 12px; left: 12px; border-width: 3px 0 0 3px; }
        .tr { top: 12px; right: 12px; border-width: 3px 3px 0 0; }
        .bl { bottom: 12px; left: 12px; border-width: 0 0 3px 3px; }
        .br { bottom: 12px; right: 12px; border-width: 0 3px 3px 0; }
        .crest { text-align: center; font-size: 48px; margin-bottom: 8px; }
        .org { text-align: center; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: ${accentColor}; margin-bottom: 4px; }
        .divider { width: 60%; margin: 16px auto; border: none; border-top: 1px solid ${borderColor}; }
        .pre { text-align: center; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #666; margin-bottom: 30px; }
        .salutation { text-align: center; font-size: 16px; color: #555; margin-bottom: 6px; }
        .name { text-align: center; font-size: 32px; font-weight: bold; color: #1a0a06; letter-spacing: 1px; margin-bottom: 4px; }
        .postnominals { text-align: center; font-size: 13px; color: ${accentColor}; font-weight: bold; letter-spacing: 2px; margin-bottom: 6px; }
        .title { text-align: center; font-size: 14px; color: #777; margin-bottom: 30px; font-style: italic; }
        .body { font-size: 15px; line-height: 1.9; color: #2c2c2c; text-align: center; margin-bottom: 32px; }
        .event-box {
          background: ${accentColor}18;
          border: 1px solid ${accentColor}55;
          border-radius: 8px;
          padding: 20px 30px;
          margin: 28px 0;
          text-align: center;
        }
        .event-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: ${accentColor}; margin-bottom: 6px; }
        .event-val { font-size: 17px; font-weight: bold; color: #1a0a06; }
        .qr-section { text-align: center; margin: 30px 0 10px; }
        .qr-code { display: inline-block; padding: 12px; border: 2px solid ${borderColor}; border-radius: 8px; background: #fff; }
        .qr-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin-top: 8px; }
        .qr-value { font-size: 13px; font-family: monospace; color: ${accentColor}; font-weight: bold; margin-top: 4px; }
        .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 40px; letter-spacing: 1px; }
        .tier-badge {
          display: inline-block; padding: 3px 12px; border: 1px solid ${accentColor};
          border-radius: 20px; font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; color: ${accentColor}; margin-bottom: 16px;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { margin: 0; border: none; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>

        <div class="crest">♛</div>
        <div class="org">Royal Protocol Management System</div>
        <div class="org" style="font-size:9px; margin-top:2px; color:#999;">Ogiame Atuwatse III · 5th Coronation Anniversary</div>
        <hr class="divider" />

        <div class="pre">Official Invitation</div>
        <div style="text-align:center; margin-bottom: 20px;">
          <span class="tier-badge">${tierLabel}</span>
        </div>

        <div class="salutation">${guest.formal_salutation || ""}</div>
        <div class="name">${guest.full_name}</div>
        ${guest.post_nominals ? `<div class="postnominals">${guest.post_nominals}</div>` : ""}
        ${guest.official_title ? `<div class="title">${guest.official_title}</div>` : ""}

        <p class="body">
          By command of His Royal Majesty, you are graciously requested to attend<br />
          the <strong>5th Coronation Anniversary Ceremony</strong> in honour of<br />
          <em>Ogiame Atuwatse III, Olu of Warri Kingdom.</em>
        </p>

        <div class="event-box">
          <div class="event-label">Date</div>
          <div class="event-val">${ceremonyDate}</div>
        </div>
        <div class="event-box">
          <div class="event-label">Venue</div>
          <div class="event-val">${venue}</div>
        </div>
        ${guest.seating_zone ? `
        <div class="event-box">
          <div class="event-label">Assigned Zone</div>
          <div class="event-val">${guest.seating_zone}</div>
        </div>` : ""}

        <div class="qr-section">
          <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(guest.qr_code || guest.id)}" width="120" height="120" alt="QR Code" />
          </div>
          <div class="qr-label">Admission Token</div>
          <div class="qr-value">${guest.qr_code || guest.id}</div>
        </div>

        <div class="footer">
          This invitation is non-transferable · Present at security checkpoint for entry<br />
          Protocol Office · Royal Palace, Warri · ${new Date().getFullYear()}
        </div>
      </div>
    </body>
    </html>
  `;
}

export default function InvitationPDFExport({ guests, invitations, open, onOpenChange }) {
  const [selected, setSelected] = useState([]);
  const [template, setTemplate] = useState("coronation");
  const [printing, setPrinting] = useState(false);

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectAll = () => setSelected(guests.map((g) => g.id));
  const clearAll = () => setSelected([]);

  const handlePrint = () => {
    if (selected.length === 0) {
      toast.error("Select at least one guest to export.");
      return;
    }
    setPrinting(true);
    const selectedGuests = guests.filter((g) => selected.includes(g.id));
    let combined = "";
    selectedGuests.forEach((g, idx) => {
      const inv = invitations.find((i) => i.guest_id === g.id);
      combined += buildInvitationHTML(g, inv, template);
      if (idx < selectedGuests.length - 1) combined += `<div style="page-break-after:always"></div>`;
    });
    const win = window.open("", "_blank");
    win.document.write(combined);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      setPrinting(false);
    }, 800);
    toast.success(`${selected.length} invitation(s) sent to printer.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Printer className="w-5 h-5 text-accent" />
            Export Print-Ready Invitations
          </DialogTitle>
          <DialogDescription>
            Select guests and a ceremony template to generate formatted PDFs.
          </DialogDescription>
        </DialogHeader>

        {/* Template picker */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Template</label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <t.icon className="w-4 h-4 text-accent" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guest list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Select Guests ({selected.length} selected)
              </label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-accent hover:underline">All</button>
                <span className="text-muted-foreground text-xs">·</span>
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:underline">None</button>
              </div>
            </div>

            <div className="border border-border rounded-lg max-h-64 overflow-y-auto divide-y divide-border/50">
              {guests.map((g) => (
                <label
                  key={g.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(g.id)}
                    onCheckedChange={() => toggle(g.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {g.formal_salutation} {g.full_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{g.category}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    g.rsvp_status === "Accepted" ? "bg-emerald-500/10 text-emerald-600"
                    : g.rsvp_status === "Declined" ? "bg-red-500/10 text-red-500"
                    : "bg-amber-500/10 text-amber-600"
                  }`}>{g.rsvp_status}</span>
                </label>
              ))}
              {guests.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-6">No guests found</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button onClick={handlePrint} disabled={printing || selected.length === 0} className="flex-1">
              <FileDown className="w-4 h-4 mr-2" />
              {printing ? "Generating..." : `Print ${selected.length > 0 ? selected.length : ""} Invitation${selected.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}