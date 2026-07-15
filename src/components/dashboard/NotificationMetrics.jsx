import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Mail, MessageSquare, MessageCircle, Send } from "lucide-react";

export default function NotificationMetrics({ totalGuests }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["notification-logs-metrics"],
    queryFn: () => base44.entities.NotificationLog.list("-created_date", 10000),
    refetchInterval: 30000,
  });

  const sent = logs.filter((l) => l.status === "Sent");
  const emailCount = sent.filter((l) =>
    l.channel === "Email" || l.channel === "Email + SMS" || l.channel === "Email + WhatsApp"
  ).length;
  const smsCount = sent.filter((l) =>
    l.channel === "SMS" || l.channel === "Email + SMS"
  ).length;
  const waCount = sent.filter((l) =>
    l.channel === "WhatsApp" || l.channel === "Email + WhatsApp"
  ).length;
  const totalSent = emailCount + smsCount + waCount;

  const cards = [
    { label: "Emails Sent", value: emailCount, icon: Mail, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "SMS Sent", value: smsCount, icon: MessageSquare, color: "text-teal-600", bg: "bg-teal-500/10" },
    { label: "WhatsApp Sent", value: waCount, icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Total Sent", value: totalSent, icon: Send, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-semibold">Notifications Dispatched</h3>
          <p className="text-xs text-muted-foreground">
            {totalSent} message{totalSent === 1 ? "" : "s"} sent across channels · {totalGuests} guest{totalGuests === 1 ? "" : "s"} on the list
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading notification metrics…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-lg border border-border bg-background/60 p-3">
                <div className={`w-8 h-8 rounded-md ${c.bg} flex items-center justify-center mb-2`}>
                  <c.icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <p className="text-2xl font-bold font-heading">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Reach progress</span>
              <span>{totalSent} sent / {totalGuests} guests</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${totalGuests ? Math.min((totalSent / totalGuests) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}