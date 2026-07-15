import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, Printer, ArrowLeft, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";
import InvitationCard from "@/components/invitations/InvitationCard";
import { buildPrintHTML } from "@/lib/invitationPrint";

export default function IVGenerator() {
  const [search, setSearch] = useState("");
  const [allGuests, setAllGuests] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Guest.list("-created_date", 10000),
      base44.entities.EventSettings.list("-created_date", 1),
    ]).then(([guests, settingsList]) => {
      setAllGuests(guests || []);
      setSettings(settingsList[0] || null);
    }).finally(() => setLoadingGuests(false));
  }, []);

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allGuests.filter(g =>
      g.full_name?.toLowerCase().includes(q) ||
      g.formal_salutation?.toLowerCase().includes(q) ||
      g.official_title?.toLowerCase().includes(q) ||
      g.qr_code?.toLowerCase().includes(q)
    );
  }, [search, allGuests]);

  const handlePrint = () => {
    if (!selectedGuest) return;
    const win = window.open("", "_blank");
    win.document.write(buildPrintHTML(selectedGuest, settings));
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 900);
  };

  // Selected guest — show invitation card with print/PDF
  if (selectedGuest) {
    return (
      <div className="min-h-[80vh] bg-[#5a0a0a] flex flex-col items-center py-8 px-4 rounded-xl">
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedGuest(null)}
            className="text-[#f5ede0] hover:bg-white/10 hover:text-[#f5ede0]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#1a0a06] font-semibold"
          >
            <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
          </Button>
        </div>
        <InvitationCard guest={selectedGuest} settings={settings} />
      </div>
    );
  }

  // Search view
  return (
    <div>
      <PageHeader
        title="IV Generator"
        subtitle="Search for a guest and generate their invitation card for printing or PDF download"
      />

      <div className="max-w-2xl mx-auto mt-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, title, or admission code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {loadingGuests && (
          <div className="flex justify-center mt-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loadingGuests && search.trim() && results.length === 0 && (
          <div className="text-center mt-12 text-muted-foreground">
            <p className="text-sm">No guests found matching "{search}"</p>
          </div>
        )}

        {!loadingGuests && results.length > 0 && (
          <div className="mt-6 space-y-2">
            {results.map(guest => (
              <button
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-base font-semibold truncate">
                    {[guest.formal_salutation, guest.full_name].filter(Boolean).join(" ")}
                    {guest.post_nominals ? `, ${guest.post_nominals}` : ""}
                  </p>
                  {guest.official_title && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{guest.official_title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{guest.category}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {guest.qr_code && (
                    <span className="font-mono text-xs text-muted-foreground hidden sm:inline">{guest.qr_code}</span>
                  )}
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </button>
            ))}
          </div>
        )}

        {!loadingGuests && !search.trim() && (
          <div className="text-center mt-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Start typing to search for a guest</p>
          </div>
        )}
      </div>
    </div>
  );
}