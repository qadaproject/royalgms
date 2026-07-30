import { Check, CheckCheck, Clock } from "lucide-react";
import { format } from "date-fns";

function StatusTicks({ status }) {
  if (!status || status === "pending") return <Clock className="w-3 h-3 text-[#667781]" />;
  if (status === "failed") return <span className="text-[10px] text-red-500 font-bold">!</span>;
  if (status === "read") return <CheckCheck className="w-4 h-4 text-[#53bdeb]" />;
  if (status === "delivered") return <CheckCheck className="w-4 h-4 text-[#667781]" />;
  // sent / accepted / received
  return <Check className="w-3.5 h-3.5 text-[#667781]" />;
}

export default function MessageBubble({ message }) {
  const isOut = message.direction === "out";
  const time = message.created_date ? format(new Date(message.created_date), "MMM d, h:mm a") : "";

  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${
          isOut ? "bg-[#d9fdd3] text-[#111b21]" : "bg-white text-[#111b21]"
        }`}
      >
        {message.template_name && (
          <p className="text-[10px] uppercase tracking-wide text-[#667781] mb-0.5">
            Template: {message.template_name}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.message_text}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-[#667781]">{time}</span>
          {isOut && <StatusTicks status={message.status} />}
        </div>
      </div>
    </div>
  );
}