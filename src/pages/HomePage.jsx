import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Itinerary", href: "/itinerary" },
  { label: "Contact", href: "/contact" },
  { label: "Itsekiris", href: "/itsekiris" },
  { label: "Directory", href: "/directory" },
  { label: "Marketplace", href: "/marketplace" },
];

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return timeLeft;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const eventTarget = new Date("2026-08-21T10:00:00+01:00"); // WAT = UTC+1
  const countdown = useCountdown(eventTarget);

  useEffect(() => {
    base44.entities.EventSettings.list("-created_date", 1).then((r) => setSettings(r[0] || null));
  }, []);

  const timelineItems = [
    { label: "Date", value: settings?.event_date ? new Date(settings.event_date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Thursday, 20 August 2026", icon: "📅" },
    { label: "Time", value: settings?.event_time || "10:00 AM (WAT)", icon: "🕙" },
    { label: "Primary Venue", value: settings?.venue_name || "Royal Palace Grounds, Aghofen", icon: "🏛️" },
    { label: "Address", value: settings?.venue_address || "Warri, Delta State, Nigeria", icon: "📍" },
    { label: "Dress Code", value: settings?.dress_code || "Traditional Royal Attire / Black Tie", icon: "👔" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0603] text-[#f5ede0] font-serif">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0603]/90 backdrop-blur-md border-b border-[#c9a84c]/20">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-[#c9a84c] text-[10px] uppercase tracking-[0.25em] font-sans">Royal Palace</span>
            <span className="text-[#f5ede0] text-sm font-semibold tracking-wider">Warri Kingdom</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className="text-[#f5ede0]/70 hover:text-[#c9a84c] text-xs uppercase tracking-[0.2em] font-sans transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <button className="md:hidden text-[#f5ede0]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0d0603] border-t border-[#c9a84c]/20 px-6 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} onClick={() => setMenuOpen(false)} className="block text-[#f5ede0]/70 hover:text-[#c9a84c] text-sm uppercase tracking-widest font-sans">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(https://media.base44.com/images/public/69f83e971133ed44e3fc81f6/a3290d03c_bg.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0603]/50 via-[#0d0603]/40 to-[#0d0603]/90" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.5em] mb-6 font-sans">Royal Palace of Warri Kingdom</p>
          <div className="w-16 h-px bg-[#c9a84c]/60 mx-auto mb-8" />
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-[#f5ede0] tracking-widest uppercase leading-none mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}>
            GLOBAL<br />HOMECOMING
          </h1>
          <div className="w-24 h-px bg-[#c9a84c] mx-auto my-6" />
          <p className="text-[#c9a84c] text-sm sm:text-base tracking-[0.3em] uppercase font-sans mb-3">5th Coronation Anniversary Celebration of</p>
          <p className="text-[#f5ede0] text-2xl sm:text-3xl font-semibold tracking-wide mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>His Majesty</p>
          <p className="text-[#f5ede0] text-3xl sm:text-4xl font-bold tracking-wide mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Ogiame Atuwatse III, CFR</p>
          <p className="text-[#c9a84c]/80 text-base sm:text-lg tracking-widest font-sans">The Olu of Warri Kingdom</p>
        </div>
        <a href="#countdown" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#f5ede0]/40 hover:text-[#c9a84c] transition-colors">
          <span className="text-[10px] uppercase tracking-widest font-sans">Scroll Down</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </section>

      {/* Countdown */}
      <section id="countdown" className="py-20 px-6 bg-[#0d0603]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-3">Counting Down To</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#f5ede0] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>21 August 2026 · 10:00 AM</h2>
          <p className="text-[#f5ede0]/40 text-xs font-sans mb-12 uppercase tracking-widest">West Africa Time (WAT)</p>
          <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Minutes", value: countdown.minutes },
              { label: "Seconds", value: countdown.seconds },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-full aspect-square bg-[#1a0a06] border border-[#c9a84c]/30 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#c9a84c]/5 to-transparent" />
                  <span className="text-3xl sm:text-5xl font-bold text-[#c9a84c] tabular-nums" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {String(value ?? 0).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[#f5ede0]/50 text-[9px] uppercase tracking-[0.3em] font-sans">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details Timeline */}
      <section className="py-20 px-6 bg-[#110804]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-3">Programme of Events</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#f5ede0]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Event Details</h2>
            <div className="w-16 h-px bg-[#c9a84c]/50 mx-auto mt-4" />
          </div>
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-px bg-[#c9a84c]/20" />
            <div className="space-y-8">
              {timelineItems.map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-[#1a0a06] border border-[#c9a84c]/40 flex items-center justify-center shrink-0 text-2xl z-10">
                    {item.icon}
                  </div>
                  <div className="pt-2 pb-6 border-b border-[#c9a84c]/10 flex-1">
                    <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans mb-1">{item.label}</p>
                    <p className="text-[#f5ede0] text-lg font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guest Itinerary Update */}
      <section className="py-20 px-6 bg-[#0d0603]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-3">Invited Guests</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#f5ede0] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Update Your Itinerary</h2>
          <p className="text-[#f5ede0]/50 text-sm font-sans mb-8 leading-relaxed">
            If you have received your official invitation, enter your Admission Token below to access your personal guest page and update your details.
          </p>
          <GuestTokenForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c9a84c]/10 py-8 text-center px-6">
        <p className="text-[#f5ede0]/30 text-xs font-sans tracking-wider">
          © 2026 Royal Guest Management System. All rights reserved.
        </p>
        <p className="text-[#f5ede0]/20 text-[10px] font-sans mt-1 uppercase tracking-widest">Royal Palace · Warri Kingdom · Delta State, Nigeria</p>
      </footer>
    </div>
  );
}

function GuestTokenForm() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = token.trim().toUpperCase();
    if (!t) return;
    setLoading(true);
    setError("");
    try {
      const results = await base44.entities.Guest.filter({ qr_code: t }, "-created_date", 1);
      if (results && results.length > 0) {
        window.location.href = `/itinerary?ref=${t}`;
      } else {
        setError("Admission token not found. Please check and try again.");
      }
    } catch {
      setError("Unable to verify token. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter Admission Token (e.g. X4KR2TBW9A)"
          className="w-full bg-[#1a0a06] border border-[#c9a84c]/30 text-[#f5ede0] placeholder:text-[#f5ede0]/30 rounded-lg px-4 py-3 text-center font-mono tracking-widest focus:outline-none focus:border-[#c9a84c]/70 text-sm"
          maxLength={10}
        />
        {error && <p className="text-red-400 text-xs mt-2 font-sans">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={loading || !token.trim()}
        className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-[#0d0603] font-bold py-3 rounded-lg font-sans text-sm uppercase tracking-widest transition-colors"
      >
        {loading ? "Verifying..." : "Access My Invitation"}
      </button>
    </form>
  );
}