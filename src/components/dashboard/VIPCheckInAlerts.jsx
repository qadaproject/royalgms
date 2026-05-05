import { useEffect, useRef, useState } from "react";
import { Crown, X, CheckCircle2 } from "lucide-react";

const VIP_CATEGORIES = ["A - Royal", "B - Federal", "E - Diplomatic"];

export default function VIPCheckInAlerts({ guests }) {
  const [alerts, setAlerts] = useState([]);
  const prevAcceptedRef = useRef(new Set());

  useEffect(() => {
    const currentAccepted = new Set(
      guests
        .filter((g) => g.rsvp_status === "Accepted" && VIP_CATEGORIES.includes(g.category))
        .map((g) => g.id)
    );

    // Find newly arrived VIPs
    currentAccepted.forEach((id) => {
      if (!prevAcceptedRef.current.has(id)) {
        const guest = guests.find((g) => g.id === id);
        if (guest) {
          const alertId = `${id}-${Date.now()}`;
          setAlerts((prev) => [...prev, { id: alertId, guest }]);
          // Auto-dismiss after 8 seconds
          setTimeout(() => {
            setAlerts((prev) => prev.filter((a) => a.id !== alertId));
          }, 8000);
        }
      }
    });

    prevAcceptedRef.current = currentAccepted;
  }, [guests]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-[#1a0a06] border border-[#c9a84c]/40 rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-5"
        >
          <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Crown className="w-4 h-4 text-[#c9a84c]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">VIP Arrived</p>
            </div>
            <p className="text-white text-sm font-semibold truncate">
              {alert.guest.formal_salutation} {alert.guest.full_name}
            </p>
            <p className="text-[#c9a84c]/70 text-[10px] truncate">{alert.guest.category}</p>
          </div>
          <button
            onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            className="text-white/30 hover:text-white/60 transition-colors mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}