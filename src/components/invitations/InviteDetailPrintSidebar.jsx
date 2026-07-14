import { Printer, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPrintHTML } from "@/lib/invitationPrint";

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