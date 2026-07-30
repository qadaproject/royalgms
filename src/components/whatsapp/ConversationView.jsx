import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Phone as PhoneIcon } from "lucide-react";
import { toast } from "sonner";
import MessageBubble from "./MessageBubble";

export default function ConversationView({ guest, phone, thread }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await base44.functions.invoke("sendWhatsAppText", { phone, text: trimmed });
      if (res?.data?.error) {
        toast.error(res.data.error);
      } else {
        const waId = res?.data?.wa_message_id || res?.data?.result?.messages?.[0]?.id || "";
        const status = res?.data?.message_status || "sent";
        await base44.entities.WhatsAppMessage.create({
          guest_id: guest.id,
          guest_name: guest.full_name,
          phone,
          direction: "out",
          message_type: "text",
          message_text: trimmed,
          status,
          wa_message_id: waId,
        });
        setText("");
      }
    } catch (e) {
      toast.error(e?.message || "Failed to send message");
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#008069] text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <PhoneIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{guest.full_name}</p>
          <p className="text-xs text-white/70">{phone}</p>
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]">
        {thread.length === 0 ? (
          <div className="text-center text-sm text-[#667781] py-12">
            No messages yet. Send a message to start the conversation.
          </div>
        ) : (
          thread.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-full px-4 py-2 bg-white border border-border text-sm outline-none focus:ring-2 focus:ring-[#008069]/30"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-full bg-[#008069] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#066b56] transition-colors"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}