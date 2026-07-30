import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useWhatsAppUnread() {
  const { data } = useQuery({
    queryKey: ["wa_unread"],
    queryFn: () => base44.entities.WhatsAppMessage.filter({ direction: "incoming", is_read: false }),
    refetchInterval: 15000,
    select: (rows) => (rows || []).length,
  });
  return data || 0;
}