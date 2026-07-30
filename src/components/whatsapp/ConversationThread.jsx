import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Loader2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import MessageBubble from "./MessageBubble";

export default function ConversationThread({ conversation, onBack }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Mark incoming messages as read when the conversation opens
  useEffect(() => {
    for (const m of conversation.messages) {
      if (m.direction === "incoming" && !m.is_read) {
        base44.entities.WhatsAppMessage.update(m.id, { is_read: true }).catch(() => {});
      }
    }
    queryClient.invalidateQueries({ queryKey: ["wa_messages"] });
    queryClient.invalidateQueries({ queryKey: ["wa_unread"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.phone]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversation.messages.length, conversation.phone]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await base44.functions.invoke("sendWhatsAppReply", {
        phone: conversation.phone,
        guest_id: conversation.guest_id,
        guest_name: conversation.guest_name,
        message: text.trim(),
      });
      setText("");
      queryClient.invalidateQueries({ queryKey: ["wa_messages"] });
    } catch (e) {
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col w-full bg-[#efeae2]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] text-white shrink-0">
        <button onClick={onBack} className="md:hidden shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold shrink-0">
          {(conversation.guest_name || conversation.phone || "?").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{conversation.guest_name || "Unknown sender"}</p>
          <p className="text-xs text-white/70 flex items-center gap-1">
            <Phone className="w-3 h-3" /> {conversation.phone}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {conversation.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 bg-[#f0f2f5] shrink-0">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!sending) handleSend();
            }
          }}
          placeholder="Type a message…"
          className="flex-1 bg-white rounded-full border-transparent h-11"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-11 h-11 rounded-full bg-[#075E54] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#054c44] shrink-0"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}