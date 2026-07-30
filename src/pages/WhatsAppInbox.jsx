import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageCircle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import ConversationList from "@/components/whatsapp/ConversationList";
import ConversationThread from "@/components/whatsapp/ConversationThread";

export default function WhatsAppInbox() {
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Backfill + keep synced from NotificationLog (WhatsApp channel)
  useQuery({
    queryKey: ["wa_sync"],
    queryFn: () => base44.functions.invoke("syncWhatsAppConversations", {}),
    refetchInterval: 30000,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["wa_messages"],
    queryFn: () => base44.entities.WhatsAppMessage.list("-created_date", 10000),
    refetchInterval: 5000,
  });

  // Real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.WhatsAppMessage.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["wa_messages"] });
      queryClient.invalidateQueries({ queryKey: ["wa_unread"] });
    });
    return unsubscribe;
  }, [queryClient]);

  // Group messages into conversations, most recent first
  const conversations = useMemo(() => {
    const map = {};
    for (const m of messages) {
      const key = m.guest_phone || m.guest_id || "unknown";
      if (!map[key]) {
        map[key] = {
          phone: m.guest_phone,
          guest_id: m.guest_id,
          guest_name: m.guest_name,
          messages: [],
          unread: 0,
          lastAt: 0,
        };
      }
      map[key].messages.push(m);
      const ts = m.created_date ? new Date(m.created_date).getTime() : 0;
      if (ts > map[key].lastAt) map[key].lastAt = ts;
      if (m.direction === "incoming" && !m.is_read) map[key].unread++;
    }
    const arr = Object.values(map);
    arr.forEach((c) =>
      c.messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    );
    arr.sort((a, b) => b.lastAt - a.lastAt);
    return arr;
  }, [messages]);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) => (c.guest_name || "").toLowerCase().includes(q) || (c.phone || "").includes(q)
    );
  }, [conversations, search]);

  const selected = conversations.find((c) => c.phone === selectedPhone);

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      <PageHeader title="WhatsApp Inbox" subtitle="Real-time conversations with invited guests" />
      <div className="flex flex-1 min-h-0 border border-border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className={`${selected ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 border-r border-border`}>
          <ConversationList
            conversations={filtered}
            selectedPhone={selectedPhone}
            onSelect={setSelectedPhone}
            search={search}
            setSearch={setSearch}
            loading={isLoading}
          />
        </div>
        <div className={`${selected ? "flex" : "hidden md:flex"} flex-1 min-h-0`}>
          {selected ? (
            <ConversationThread conversation={selected} onBack={() => setSelectedPhone(null)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-[#f7f8fa]">
              <MessageCircle className="w-14 h-14 mb-3 opacity-30" />
              <p className="text-sm">Select a contact to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}