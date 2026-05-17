import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, AlertTriangle, QrCode,
  Search, Loader2, RefreshCw, MapPin, Users, Camera, Shield
} from "lucide-react";
import RoyalCrest from "../components/layout/RoyalCrest";
import CategoryBadge from "../components/shared/CategoryBadge";

const STATUS_CONFIG = {
  Accepted: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "CLEARED FOR ENTRY",
    glow: "shadow-[0_0_40px_rgba(52,211,153,0.15)]",
  },
  Pending: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "RSVP PENDING — VERIFY MANUALLY",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.15)]",
  },
  Declined: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    text: "INVITATION DECLINED",
    glow: "shadow-[0_0_40px_rgba(248,113,113,0.15)]",
  },
  Proxy: {
    icon: AlertTriangle,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "PROXY ATTENDEE",
    glow: "shadow-[0_0_40px_rgba(96,165,250,0.15)]",
  },
};

const GATES = ["Main Gate", "VIP Entrance", "East Wing", "West Wing", "Protocol Gate"];

export default function CheckInScanner() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null); // { guest, success }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gate, setGate] = useState("Main Gate");
  const [recentScans, setRecentScans] = useState([]);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const startCamera = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Camera access denied. Use manual input below.");
      setScanning(false);
    }
  };

  const verifyToken = async (token) => {
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Search by rsvp_token first, then qr_code, then name
      let guests = await base44.entities.Guest.filter(
        { rsvp_token: token.trim() },
        "-created_date",
        1
      );

      if (!guests?.length) {
        guests = await base44.entities.Guest.filter(
          { qr_code: token.trim().toUpperCase() },
          "-created_date",
          1
        );
      }

      if (!guests?.length) {
        const all = await base44.entities.Guest.list("-created_date", 500);
        const q = token.trim().toLowerCase();
        guests = all.filter(
          (g) =>
            g.full_name?.toLowerCase().includes(q) ||
            g.rsvp_token?.toLowerCase() === q ||
            g.qr_code?.toLowerCase() === q
        ).slice(0, 1);
      }

      if (guests?.length) {
        const guest = guests[0];
        const success = guest.rsvp_status === "Accepted" || guest.rsvp_status === "Proxy";

        // Log check-in activity
        await base44.entities.GuestActivityLog.create({
          guest_id: guest.id,
          guest_name: guest.full_name,
          event_type: "rsvp_status_changed",
          description: `Guest scanned at ${gate} — Status: ${guest.rsvp_status}`,
          old_value: guest.rsvp_status,
          new_value: guest.rsvp_status,
          performed_by: gate,
        });

        setResult({ guest, success });
        setRecentScans((prev) => [
          {
            id: guest.id,
            name: guest.full_name,
            status: guest.rsvp_status,
            gate,
            time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            success,
          },
          ...prev.slice(0, 19),
        ]);
      } else {
        setError("No guest found for this token or name.");
      }
    } catch {
      setError("Verification failed. Check connection.");
    }

    setLoading(false);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cfg = result ? (STATUS_CONFIG[result.guest.rsvp_status] || STATUS_CONFIG["Pending"]) : null;
  const g = result?.guest;

  return (
    <div className="min-h-screen bg-[#0d0604] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a0a06] border-b border-[#c9a84c]/20 px-4 py-3 flex items-center gap-3">
        <RoyalCrest size="sm" />
        <div>
          <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">Check-In Scanner</p>
          <p className="text-white/40 text-[10px]">RSVP Token Verification — Ògíame Atúwàtse III</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <select
            value={gate}
            onChange={(e) => setGate(e.target.value)}
            className="bg-[#1a0a06] border border-[#c9a84c]/30 text-[#c9a84c] text-xs rounded-md px-3 py-1.5 focus:outline-none"
          >
            {GATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="flex items-center gap-1.5 text-[#c9a84c]">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">LIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full">

          {/* Camera scanner */}
          <div className="bg-[#1a0a06]/80 border border-[#c9a84c]/20 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#c9a84c]/10">
              <p className="text-[#c9a84c] text-xs uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" /> QR Camera Scanner
              </p>
              {!scanning ? (
                <Button size="sm" onClick={startCamera} className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0604] text-xs h-7">
                  Activate Camera
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={stopCamera} className="text-red-400 text-xs h-7">
                  Stop
                </Button>
              )}
            </div>
            <div className="relative bg-black aspect-video max-h-48">
              {scanning ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                  <QrCode className="w-10 h-10 mb-2" />
                  <p className="text-xs">Camera inactive — activate to scan QR codes</p>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-36 h-36">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#c9a84c]" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#c9a84c]" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#c9a84c]" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#c9a84c]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-[#c9a84c]/60 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual input */}
          <div className="bg-[#1a0a06]/80 border border-[#c9a84c]/20 rounded-xl p-4">
            <p className="text-[#c9a84c] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Manual Token / Name Entry
            </p>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyToken(query)}
                placeholder="Scan RSVP token, QR code, or type guest name..."
                className="bg-[#0d0604] border-[#c9a84c]/20 text-white placeholder:text-white/30 focus:border-[#c9a84c]/60 flex-1 font-mono text-sm"
              />
              <Button
                onClick={() => verifyToken(query)}
                disabled={loading || !query.trim()}
                className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0604] px-5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
            <p className="text-white/30 text-[10px] mt-2">Press Enter or click Verify — input auto-focuses for rapid scanning</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && cfg && g && (
            <div className={`border rounded-2xl overflow-hidden ${cfg.bg} ${cfg.glow} transition-all duration-500`}>
              {/* Status banner */}
              <div className={`px-5 py-4 flex items-center gap-3 border-b ${result.success ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <cfg.icon className={`w-10 h-10 ${cfg.color} shrink-0`} />
                <div className="flex-1">
                  <p className={`text-xl font-bold tracking-widest ${cfg.color} uppercase`}>{cfg.text}</p>
                  <p className="text-white/40 text-xs mt-0.5">{gate} · {new Date().toLocaleTimeString()}</p>
                </div>
                <button onClick={() => { setResult(null); setError(""); }} className="text-white/30 hover:text-white/60 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Guest info */}
              <div className="p-5 space-y-4">
                <div className="text-center">
                  {g.formal_salutation && (
                    <p className="text-[#c9a84c] text-xs uppercase tracking-wider">{g.formal_salutation}</p>
                  )}
                  <h2 className="font-heading text-2xl font-bold text-white mt-1">{g.full_name}</h2>
                  {g.post_nominals && (
                    <p className="text-[#c9a84c] text-sm font-semibold tracking-wider mt-0.5">{g.post_nominals}</p>
                  )}
                  {g.official_title && (
                    <p className="text-white/60 text-sm mt-1 italic">{g.official_title}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 bg-black/20 rounded-xl p-4">
                  <div className="text-center">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Category</p>
                    <CategoryBadge category={g.category} />
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Zone</p>
                    <p className="text-white text-xs font-medium flex items-center justify-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#c9a84c]" />
                      {g.seating_zone || "Unassigned"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Security</p>
                    <p className="text-white text-xs font-medium flex items-center justify-center gap-0.5">
                      <Users className="w-2.5 h-2.5 text-[#c9a84c]" />
                      {g.security_detail_size || 0} aides
                    </p>
                  </div>
                </div>

                {g.special_requirements && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-amber-400 text-[10px] uppercase font-bold tracking-wider">Security Alert</p>
                      <p className="text-amber-200/80 text-xs mt-0.5">{g.special_requirements}</p>
                    </div>
                  </div>
                )}

                {g.qr_code && (
                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-white p-1.5 rounded-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(g.qr_code)}`}
                        alt="QR"
                        className="w-16 h-16"
                      />
                    </div>
                    <p className="text-[#c9a84c] font-mono text-sm font-bold tracking-widest">{g.qr_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scan log sidebar */}
        <div className="lg:w-72 p-4 border-t lg:border-t-0 lg:border-l border-[#c9a84c]/10">
          <p className="text-[#c9a84c] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Scan Log — {gate}
            <Badge className="ml-auto bg-white/10 text-white/60 border-0 text-[9px]">{recentScans.length}</Badge>
          </p>
          {recentScans.length === 0 ? (
            <p className="text-white/30 text-xs">No scans yet at this gate</p>
          ) : (
            <div className="space-y-1.5">
              {recentScans.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${s.success ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-red-500/5 border border-red-500/10"}`}
                >
                  {s.success
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs truncate">{s.name}</p>
                    <p className="text-white/30 text-[9px]">{s.time} · {s.gate}</p>
                  </div>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${s.success ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}