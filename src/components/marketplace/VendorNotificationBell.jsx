import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, MessageSquare, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VendorNotificationBell({ vendorId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`vendor_notif_seen_${vendorId}`) || "[]"); } catch { return []; }
  });
  const panelRef = useRef(null);

  useEffect(() => {
    if (!vendorId) return;
    // Load recent comments
    base44.entities.VendorProductInteraction.filter({ vendor_id: vendorId, type: "comment" })
      .then(items => {
        const sorted = items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 20);
        setNotifications(sorted);
      });

    // Subscribe to new interactions
    const unsub = base44.entities.VendorProductInteraction.subscribe((event) => {
      if (event.type === "create" && event.data?.vendor_id === vendorId && event.data?.type === "comment") {
        setNotifications(prev => [event.data, ...prev].slice(0, 20));
      }
    });
    return unsub;
  }, [vendorId]);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter(n => !seen.includes(n.id));

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setSeen(allIds);
    localStorage.setItem(`vendor_notif_seen_${vendorId}`, JSON.stringify(allIds));
  };

  const formatTime = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">Comment Alerts</span>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No comments yet
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.map(n => (
                <li key={n.id} className={`px-4 py-3 ${!seen.includes(n.id) ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{n.author_name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_date)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}