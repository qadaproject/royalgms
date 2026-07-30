import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useWhatsAppUnread } from "@/hooks/useWhatsAppUnread";

export default function AdminWhatsAppNotif() {
  const unread = useWhatsAppUnread();
  return (
    <Link
      to="/whatsapp-inbox"
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
      title="WhatsApp Inbox"
    >
      <MessageCircle className="w-5 h-5 text-[#25D366]" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-[#25D366] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}