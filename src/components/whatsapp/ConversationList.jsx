import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, isToday, isYesterday } from "date-fns";

function timeLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "dd/MM/yy");
}

export default function ConversationList({ conversations, selectedPhone, onSelect, search, setSearch, loading }) {
  return (
    <div className="flex flex-col w-full bg-[#f7f8fa]">
      <div className="p-3 bg-[#075E54]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="pl-9 h-9 bg-white/95 border-transparent text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-sm text-muted-foreground">Loading conversations…</div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <MessageCircle className="w-9 h-9 mx-auto mb-2 opacity-40" />
            No WhatsApp conversations yet
          </div>
        )}
        {conversations.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const isActive = c.phone === selectedPhone;
          return (
            <button
              key={c.phone}
              onClick={() => onSelect(c.phone)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-black/5 transition-colors ${
                isActive ? "bg-white" : "hover:bg-white/60"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center text-white font-semibold shrink-0">
                {(c.guest_name || c.phone || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate text-foreground">{c.guest_name || c.phone}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeLabel(last?.created_date)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {last?.direction === "outgoing" ? "You: " : ""}{last?.message_text || ""}
                  </p>
                  {c.unread > 0 && (
                    <span className="bg-[#25D366] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shrink-0">
                      {c.unread > 99 ? "99+" : c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}