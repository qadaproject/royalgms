import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, Search, CheckCircle2, XCircle, AlertTriangle, Shield, Users, MapPin, Loader2, RefreshCw } from "lucide-react";
import RoyalCrest from "../components/layout/RoyalCrest";
import CategoryBadge from "../components/shared/CategoryBadge";

const statusConfig = {
  Accepted: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "CLEARED FOR ENTRY" },
  Pending: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "RSVP PENDING" },
  Declined: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "DECLINED INVITATION" },
  Proxy: { icon: AlertTriangle, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", label: "PROXY ATTENDEE" },
};

export default function SecurityCheckpoint() {
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanHistory, setScanHistory] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const lookup = async (code) => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Try exact QR code match first
      let results = await base44.entities.Guest.filter({ qr_code: code.trim() }, "-created_date", 1);
      // If no result, try fetching all and filtering by name
      if (!results || results.length === 0) {
        const all = await base44.entities.Guest.list("-created_date", 500);
        const q = code.trim().toLowerCase();
        results = all.filter(
          (g) =>
            g.full_name?.toLowerCase().includes(q) ||
            g.qr_code?.toLowerCase().includes(q) ||
            g.official_title?.toLowerCase().includes(q)
        ).slice(0, 1);
      }
      if (results && results.length > 0) {
        const g = results[0];
        setResult(g);
        setScanHistory((prev) => [{ id: g.id, name: g.full_name, status: g.rsvp_status, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
      } else {
        setError("No guest found for this code or name. Verify manually.");
      }
    } catch {
      setError("Lookup failed. Check connection.");
    }
    setLoading(false);
  };

  const startCamera = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Camera access denied.");
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setScanning(false);
  };

  useEffect(() => () => stopCamera(), []);

  const cfg = result ? (statusConfig[result.rsvp_status] || statusConfig["Pending"]) : null;

  return (
    <div className="min-h-screen bg-[#0d0604] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a0a06] border-b border-[#c9a84c]/20 px-4 py-3 flex items-center gap-3">
        <RoyalCrest size="sm" />
        <div>
          <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">Security Checkpoint</p>
          <p className="text-white/50 text-[10px]">Ogiame Atuwatse III — 5th Coronation</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[#c9a84c]">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-wider">ACTIVE</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-0">
        {/* Main scan area */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Manual Search */}
          <div className="bg-[#1a0a06]/80 border border-[#c9a84c]/20 rounded-xl p-4">
            <p className="text-[#c9a84c] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Manual Code / Name Search
            </p>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup(query)}
                placeholder="Enter QR code (e.g. RGMS-ROYAL-001) or guest name..."
                className="bg-[#0d0604] border-[#c9a84c]/20 text-white placeholder:text-white/30 focus:border-[#c9a84c]/60 flex-1"
              />
              <Button
                onClick={() => lookup(query)}
                disabled={loading}
                className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0604] px-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Camera Scanner */}
          <div className="bg-[#1a0a06]/80 border border-[#c9a84c]/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#c9a84c] text-xs uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" /> Camera Scanner
              </p>
              {!scanning ? (
                <Button size="sm" onClick={startCamera} className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0604] text-xs h-7">
                  Start Camera
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={stopCamera} className="text-red-400 hover:text-red-300 text-xs h-7">
                  Stop
                </Button>
              )}
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video max-h-56">
              {scanning ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                  <Camera className="w-10 h-10 mb-2" />
                  <p className="text-xs">Camera inactive</p>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-40 border-2 border-[#c9a84c]/70 rounded-lg">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#c9a84c]" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#c9a84c]" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#c9a84c]" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#c9a84c]" />
                  </div>
                </div>
              )}
            </div>
            {scanning && (
              <p className="text-white/40 text-xs text-center mt-2">Point camera at QR code on invitation card</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Result Card */}
          {result && cfg && (
            <div className={`border rounded-xl p-5 ${cfg.bg}`}>
              <div className="flex items-center gap-3 mb-4">
                <cfg.icon className={`w-8 h-8 ${cfg.color} shrink-0`} />
                <div>
                  <p className={`text-lg font-bold tracking-wider ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-white/50 text-xs">{new Date().toLocaleString()}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto text-white/40" onClick={() => { setResult(null); setQuery(""); }}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-black/30 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Guest</p>
                  <p className="text-white font-heading text-xl font-semibold">
                    {result.formal_salutation} {result.full_name}
                  </p>
                  {result.post_nominals && <p className="text-[#c9a84c] text-xs font-semibold">{result.post_nominals}</p>}
                  {result.official_title && <p className="text-white/60 text-sm">{result.official_title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Category</p>
                    <CategoryBadge category={result.category} />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Seating Zone</p>
                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-[#c9a84c]" />
                      {result.seating_zone || "Unassigned"}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Security Detail</p>
                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                      <Users className="w-3.5 h-3.5 text-[#c9a84c]" />
                      {result.security_detail_size || 0} aides
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Protocol</p>
                    <span className={`text-xs font-medium ${result.protocol_validated ? "text-emerald-400" : "text-amber-400"}`}>
                      {result.protocol_validated ? "✓ Validated" : "⚠ Not Validated"}
                    </span>
                  </div>
                </div>

                {result.special_requirements && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-2">
                    <p className="text-amber-400 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Security Note
                    </p>
                    <p className="text-amber-200/80 text-xs">{result.special_requirements}</p>
                  </div>
                )}

                {result.dietary_requirements && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-1">Dietary</p>
                    <p className="text-blue-200/80 text-xs">{result.dietary_requirements}</p>
                  </div>
                )}

                {result.arrival_details && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Arrival Details</p>
                    <p className="text-white/70 text-xs">{result.arrival_details}</p>
                  </div>
                )}

                {result.qr_code && (
                  <div className="pt-3 border-t border-white/10 flex flex-col items-center gap-2">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Admission Token</p>
                    <div className="bg-white p-2 rounded-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(result.qr_code)}`}
                        alt="QR Code"
                        className="w-28 h-28"
                      />
                    </div>
                    <p className="text-[#c9a84c] text-xs font-mono font-bold tracking-widest">{result.qr_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — scan history */}
        <div className="lg:w-64 p-4 border-t lg:border-t-0 lg:border-l border-[#c9a84c]/10">
          <p className="text-[#c9a84c] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Scan Log
          </p>
          {scanHistory.length === 0 ? (
            <p className="text-white/30 text-xs">No scans yet</p>
          ) : (
            <div className="space-y-2">
              {scanHistory.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${entry.status === "Accepted" ? "bg-emerald-400" : entry.status === "Declined" ? "bg-red-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs truncate">{entry.name}</p>
                    <p className="text-white/30 text-[10px]">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}