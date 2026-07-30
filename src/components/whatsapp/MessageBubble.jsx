import { Check, CheckCheck, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function MessageBubble({ message }) {
  const outgoing = message.direction === "outgoing";
  return (
    <div className={`flex ${outgoing ? "justify-end" : "justify-start"} mb-1.5`}>
      <div
        className={`max-w-[78%] px-3 py-2 rounded-lg shadow-sm text-sm leading-relaxed ${
          outgoing ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none" : "bg-white text-[#111b21] rounded-tl-none"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.message_text}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
          <span className="text-[10px] text-[#667781]">
            {message.created_date ? format(new Date(message.created_date), "MMM d, HH:mm") : ""}
          </span>
          {outgoing && (
            message.status === "read" ? <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
            : message.status === "delivered" ? <CheckCheck className="w-3.5 h-3.5 text-[#667781]" />
            : message.status === "failed" ? <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            : <Check className="w-3.5 h-3.5 text-[#667781]" />
          )}
        </div>
      </div>
    </div>
  );
}