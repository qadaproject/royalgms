import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Crown, Clock } from "lucide-react";

export default function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ["event_settings"],
    queryFn: () => base44.entities.EventSettings.list("-created_date", 1),
  });

  const eventDate = settings[0]?.event_date;
  const eventName = settings[0]?.event_name || "5th Coronation Anniversary";
  const eventTime = settings[0]?.event_time || "10:00 AM";

  useEffect(() => {
    if (!eventDate) return;
    const calc = () => {
      const target = new Date(`${eventDate}T${eventTime.includes("AM") || eventTime.includes("PM") ? convertTo24(eventTime) : eventTime}`);
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, past: false });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  function convertTo24(time12) {
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = parseInt(hours, 10) + 12;
    return `${hours}:${minutes || "00"}:00`;
  }

  if (!eventDate) return null;

  return (
    <div className="bg-gradient-to-br from-primary/90 to-primary border border-primary rounded-xl p-5 mb-8 text-primary-foreground">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-4 h-4 text-accent" />
        <p className="text-xs uppercase tracking-widest text-primary-foreground/70 font-semibold">
          {timeLeft?.past ? "Event has commenced" : "Countdown to Event"}
        </p>
      </div>
      <p className="font-heading text-lg font-semibold mb-4 leading-tight">{eventName}</p>
      {timeLeft && !timeLeft.past ? (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="text-center bg-black/20 rounded-lg py-3 px-2">
              <p className="text-3xl sm:text-4xl font-bold font-heading text-accent tabular-nums">
                {String(value).padStart(2, "0")}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      ) : timeLeft?.past ? (
        <div className="flex items-center gap-2 text-accent">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">The event is underway</span>
        </div>
      ) : (
        <div className="animate-pulse text-primary-foreground/50 text-sm">Loading...</div>
      )}
      <p className="text-xs text-primary-foreground/50 mt-3">{eventDate} — {eventTime}</p>
    </div>
  );
}