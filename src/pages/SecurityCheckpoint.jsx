import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Search, CheckCircle2, XCircle, AlertTriangle, Shield, Users, MapPin, Loader2, RefreshCw, UserCheck, List } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import RoyalCrest from "../components/layout/RoyalCrest";
import CategoryBadge from "../components/shared/CategoryBadge";
import DailySummaryDownload from "../components/checkpoint/DailySummaryDownload";

const statusConfig = {
  Accepted: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "CLEARED FOR ENTRY" },
  Pending: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "RSVP PENDING" },
  Declined: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "DECLINED INVITATION" },
  Proxy: { icon: AlertTriangle, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", label: "PROXY ATTENDEE" },
};

const CATEGORIES = [
  "A - Royal", "B - Federal", "C - State", "D - Corporate",
  "E - Diplomatic", "F - Traditional", "G - General",
  "H - Socials", "I - Communities", "J - Chiefs"
];

const RSVP_STATUSES = ["Accepted", "Pending", "Declined", "Proxy"];

export default function SecurityCheckpoint() {
  const [allGuests, setAllGuests] = useState([]);
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkedIn, setCheckedIn] = useState({});
  const [checkingIn, setCheckingIn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Log panel state
  const [activeTab, setActiveTab] = useState("scanner"); // "scanner" | "log"
  const [checkInLogs, setCheckInLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logFilterCategory, setLogFilterCategory] = useState("all");
  const [logFilterStatus, setLogFilterStatus] = useState("all");

  const fetchLogs = async () => {
    setLogsLoading(true);
    const logs = await base44.entities.CheckInLog.list("-checked_in_at", 500);
    setCheckInLogs(logs);
    setLogsLoading(false);
  };

  const lookup = async (code) => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let results = await base44.entities.Guest.filter({ qr_code: code.trim().toUpperCase() }, "-created_date", 1);
      if (!results || results.length === 0) {
        const all = await base44.entities.Guest.list("-created_date", 500);
        setAllGuests(all);
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
        setCheckedIn((prev) => ({ ...prev }));
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

  useEffect(() => {
    base44.entities.Guest.list("-created_date", 500).then(setAllGuests).catch(() => {});
  }, []);

  useEffect(() => () => stopCamera(), []);

  // Fetch logs when log tab is opened
  useEffect(() => {
    if (activeTab === "log") fetchLogs();
  }, [activeTab]);

  const cfg = result ? (statusConfig[result.rsvp_status] || statusConfig["Pending"]) : null;

  const handleCheckIn = async (guest, checked) => {
    setCheckingIn(true);
    try {
      const newStatus = checked ? "Accepted" : "Pending";
      await base44.entities.Guest.update(guest.id, { rsvp_status: newStatus });

      // Persist check-in log record
      if (checked) {
        await base44.entities.CheckInLog.create({
          guest_id: guest.id,
          guest_name: guest.full_name,
          formal_salutation: guest.formal_salutation || "",
          official_title: guest.official_title || "",
          category: guest.category || "",
          rsvp_status: newStatus,
          seating_zone: guest.seating_zone || "",
          gate: "Security Checkpoint",
          checked_in_at: new Date().toISOString(),
          qr_code: guest.qr_code || "",
          security_detail_size: guest.security_detail_size || 0,
        });
      }

      setResult((prev) => prev ? { ...prev, rsvp_status: newStatus } : prev);
      setCheckedIn((prev) => ({ ...prev, [guest.id]: checked }));
    } catch {
      // silently ignore
    }
    setCheckingIn(false);
  };

  // Filtered logs
  const filteredLogs = checkInLogs.filter(l => {
    const matchSearch = !logSearch ||
      l.guest_name?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.official_title?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.seating_zone?.toLowerCase().includes(logSearch.toLowerCase());
    const matchCategory = logFilterCategory === "all" || l.category === logFilterCategory;
    const matchStatus = logFilterStatus === "all" || l.rsvp_status === logFilterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#0d0604] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a0a06] border-b border-[#c9a84c]/20 px-4 py-3 flex items-center gap-3">
        <RoyalCrest size="sm" />
        <div>
          <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-semibold">Security Checkpoint</p>
          <p className="text-white/50 text-[10px]">Ògíame Atúwàtse III, CFR — 5th Coronation</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <DailySummaryDownload guests={allGuests.length ? allGuests : []} />
          <div className="flex items-center gap-2 text-[#c9a84c]">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-[#1a0a06] border-b border-[#c9a84c]/10 px-4 flex gap-1">
        <button
          onClick={() => setActiveTab("scanner")}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${activeTab === "scanner" ? "border-[#c9a84c] text-[#c9a84c]" : "border-transparent text-white/40 hover:text-white/60"}`}
        >
          <Search className="w-3.5 h-3.5 inline mr-1.5" />Scanner
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${activeTab === "log" ? "border-[#c9a84c] text-[#c9a84c]" : "border-transparent text-white/40 hover:text-white/60"}`}
        >
          <List className="w-3.5 h-3.5 inline mr-1.5" />Check-In Log
          {checkInLogs.length > 0 && (
            <span className="ml-1.5 bg-[#c9a84c]/20 text-[#c9a84c] text-[9px] px-1.5 py-0.5 rounded-full">{checkInLogs.length}</span>
          )}
        </button>
      </div>

      {/* Scanner Tab */}
      {activeTab === "scanner" && (
        <div className="flex-1 flex flex-col lg:flex-row gap-0">
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
                <Button onClick={() => lookup(query)} disabled={loading} className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0604] px-4">
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
                  <Button size="sm" onClick={startCamera} className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0604] text-xs h-7">Start Camera</Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={stopCamera} className="text-red-400 hover:text-red-300 text-xs h-7">Stop</Button>
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
              {scanning && <p className="text-white/40 text-xs text-center mt-2">Point camera at QR code on invitation card</p>}
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

                {/* Check-in toggle */}
                <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3 mb-3 border border-white/10">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#c9a84c]" />
                    <span className="text-sm font-semibold text-white/90">Mark as Arrived on Site</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {checkingIn && <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />}
                    <Switch
                      checked={result.rsvp_status === "Accepted"}
                      onCheckedChange={(v) => handleCheckIn(result, v)}
                      disabled={checkingIn}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">Guest</p>
                    <p className="text-white font-heading text-xl font-semibold">{result.formal_salutation} {result.full_name}</p>
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
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(result.qr_code)}`} alt="QR Code" className="w-28 h-28" />
                      </div>
                      <p className="text-[#c9a84c] text-xs font-mono font-bold tracking-widest">{result.qr_code}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check-In Log Tab */}
      {activeTab === "log" && (
        <div className="flex-1 p-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Search by name, title, zone..."
              className="bg-[#1a0a06] border-[#c9a84c]/20 text-white placeholder:text-white/30 w-56"
            />
            <Select value={logFilterCategory} onValueChange={setLogFilterCategory}>
              <SelectTrigger className="w-44 bg-[#1a0a06] border-[#c9a84c]/20 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={logFilterStatus} onValueChange={setLogFilterStatus}>
              <SelectTrigger className="w-36 bg-[#1a0a06] border-[#c9a84c]/20 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {RSVP_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={fetchLogs} className="text-[#c9a84c] hover:text-[#c9a84c]/80 ml-auto gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <span className="text-white/40 text-xs">{filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Log Table */}
          <div className="bg-[#1a0a06] border border-[#c9a84c]/15 rounded-xl overflow-hidden">
            {logsLoading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#c9a84c]" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-white/30 text-sm">No check-in records found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#c9a84c]/5 border-b border-[#c9a84c]/10">
                  <tr>
                    <th className="text-left px-4 py-3 text-[#c9a84c] text-[10px] uppercase tracking-wider font-semibold">Guest</th>
                    <th className="text-left px-4 py-3 text-[#c9a84c] text-[10px] uppercase tracking-wider font-semibold hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-[#c9a84c] text-[10px] uppercase tracking-wider font-semibold hidden md:table-cell">Zone</th>
                    <th className="text-left px-4 py-3 text-[#c9a84c] text-[10px] uppercase tracking-wider font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-[#c9a84c] text-[10px] uppercase tracking-wider font-semibold hidden lg:table-cell">Gate</th>
                    <th className="text-left px-4 py-3 text-[#c9a84c] text-[10px] uppercase tracking-wider font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white/90 font-medium text-sm">
                          {log.formal_salutation ? `${log.formal_salutation} ` : ""}{log.guest_name}
                        </p>
                        {log.official_title && <p className="text-white/40 text-xs truncate max-w-[180px]">{log.official_title}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-white/50 text-xs">{log.category || "—"}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-white/50 text-xs">
                          <MapPin className="w-3 h-3 text-[#c9a84c]/50" />
                          {log.seating_zone || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] border-0 ${
                          log.rsvp_status === "Accepted" ? "bg-emerald-500/20 text-emerald-400" :
                          log.rsvp_status === "Declined" ? "bg-red-500/20 text-red-400" :
                          log.rsvp_status === "Proxy" ? "bg-blue-500/20 text-blue-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {log.rsvp_status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-white/40 text-xs">{log.gate || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/50 text-xs whitespace-nowrap">
                          {log.checked_in_at ? new Date(log.checked_in_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }) : "—"}
                        </span>
                        <p className="text-white/25 text-[10px]">
                          {log.checked_in_at ? new Date(log.checked_in_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", timeZone: "Africa/Lagos" }) : ""}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}