import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "../components/shared/PageHeader";
import ConversationView from "@/components/whatsapp/ConversationView";

function formatPhone(phone) {
  if (!phone) return null;
  let p = phone.toString().replace(/\D/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) return "234" + p.slice(1);
  if (p.startsWith("234")) return p;
  if (p.length === 10 && /^[789]/.test(p)) return "234" + p;
  return p;
}

export default function WhatsAppInbox() {
  const [search, setSearch] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const queryClient = useQueryClient();

  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: () => base44.entities.Guest.list("-created_date", 10000),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["whatsapp_messages"],
    queryFn: () => base44.entities.WhatsAppMessage.list("-created_date", 10000),
  });

  // Real-time: refresh messages when a new one is created/updated
  useEffect(() => {
    const unsub = base44.entities.WhatsAppMessage.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_messages"] });
    });
    return unsub;
  }, [queryClient]);

  // Build contacts: guests with a phone, enriched with their conversation thread
  const contacts = useMemo(() => {
    const byPhone = {};
    for (const m of messages) {
      if (!m.phone) continue;
      if (!byPhone[m.phone]) byPhone[m.phone] = [];
      byPhone[m.phone].push(m);
    }

    const list = guests
      .filter((g) => g.phone || g.contact_person_phone)
      .map((g) => {
        const phone = formatPhone(g.phone || g.contact_person_phone);
        const thread = ((byPhone[phone] || [])).sort(
          (a, b) => new Date(a.created_date) - new Date(b.created_date)
        );
        const last = thread[thread.length - 1];
        return { guest: g, phone, thread, last, lastTime: last?.created_date };
      })
      .filter((c) => c.phone);

    list.sort((a, b) => {
      if (a.lastTime && b.lastTime) return new Date(b.lastTime) - new Date(a.lastTime);
      if (a.lastTime) return -1;
      if (b.lastTime) return 1;
      return (a.guest.full_name || "").localeCompare(b.guest.full_name || "");
    });
    return list;
  }, [guests, messages]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) =>
      (c.guest.full_name || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q) ||
      (c.guest.phone || "").toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const selected = contacts.find((c) => c.guest.id === selectedGuestId) || null;

  return (
    <div>
      <PageHeader
        title="WhatsApp Inbox"
        subtitle="Real-time WhatsApp conversations with your guests"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-13rem)] min-h-[480px]">
        {/* Contacts panel */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="pl-9 h-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                {guests.length === 0 ? "No guests in registry" : "No matching contacts"}
              </div>
            ) : (
              filteredContacts.map((c) => {
                const active = selectedGuestId === c.guest.id;
                return (
                  <button
                    key={c.guest.id}
                    onClick={() => setSelectedGuestId(c.guest.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-border/50 transition-colors ${
                      active ? "bg-[#f0f2f5]" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#d9fdd3] flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-[#075e54]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{c.guest.full_name}</p>
                        {c.lastTime && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {format(new Date(c.lastTime), "MMM d")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.last ? c.last.message_text || c.last.template_name || "Media" : c.phone}
                      </p>
                    </div>
                    {c.last?.direction === "in" && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25d366] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2 rounded-xl border border-border overflow-hidden bg-[#efeae2]">
          {selected ? (
            <ConversationView
              guest={selected.guest}
              phone={selected.phone}
              thread={selected.thread}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-3 text-[#25d366]" />
              <p className="text-sm">Select a contact to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}