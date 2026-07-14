import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, Lock, Edit3, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Itinerary", href: "/itinerary" },
  { label: "Contact", href: "/contact" },
];

const FIELD_LABELS = {
  formal_salutation: "Formal Salutation",
  official_title: "Official Title",
  post_nominals: "Post Nominals (e.g. CFR, OFR)",
  email: "Email Address",
  phone: "Phone Number",
  contact_person_name: "PA / Aide Name",
  contact_person_phone: "PA / Aide Phone",
  contact_person_email: "PA / Aide Email",
  dietary_requirements: "Dietary Requirements",
  medical_alerts: "Medical Alerts / Conditions",
  security_detail_size: "Security Detail Size",
  arrival_details: "Arrival Details (flight/vehicle)",
};

export default function ItineraryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const refToken = urlParams.get("ref") || urlParams.get("token") || "";

  const [tokenInput, setTokenInput] = useState(refToken);
  const [guest, setGuest] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(!!refToken);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});
  const [corrections, setCorrections] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const lookupGuest = async (t) => {
    const tok = t.trim().toUpperCase();
    if (!tok) return;
    setLoading(true);
    setError("");
    try {
      const [results, settingsList] = await Promise.all([
        base44.entities.Guest.filter({ qr_code: tok }, "-created_date", 1),
        base44.entities.EventSettings.list("-created_date", 1),
      ]);
      if (results && results.length > 0) {
        const g = results[0];
        setGuest(g);
        setSettings(settingsList[0] || null);
        const f = {};
        Object.keys(FIELD_LABELS).forEach((k) => { f[k] = g[k] || ""; });
        f.rsvp_status = g.rsvp_status || "Pending";
        setForm(f);
      } else {
        setError("Admission token not found. Please check and try again.");
      }
    } catch {
      setError("Unable to verify token. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (refToken) lookupGuest(refToken);
  }, []);

  const handleSave = async () => {
    if (!guest) return;
    setSaving(true);
    const updates = {};
    Object.keys(FIELD_LABELS).forEach((k) => { if (form[k] !== (guest[k] || "")) updates[k] = form[k]; });
    if (form.rsvp_status !== guest.rsvp_status) updates.rsvp_status = form.rsvp_status;

    if (Object.keys(updates).length > 0) {
      await base44.entities.Guest.update(guest.id, updates);
      // Log the update
      await base44.entities.GuestActivityLog.create({
        guest_id: guest.id,
        guest_name: guest.full_name,
        event_type: "rsvp_status_changed",
        description: `Guest self-updated itinerary via portal. Fields: ${Object.keys(updates).join(", ")}${corrections ? ` | Comments: ${corrections}` : ""}`,
        old_value: JSON.stringify(Object.keys(updates).reduce((a, k) => ({ ...a, [k]: guest[k] || "" }), {})),
        new_value: JSON.stringify(updates),
        performed_by: "Guest Portal",
      });
      setGuest({ ...guest, ...updates });
    }
    if (corrections) {
      await base44.entities.GuestActivityLog.create({
        guest_id: guest.id,
        guest_name: guest.full_name,
        event_type: "rsvp_status_changed",
        description: `Guest comments/correction request: ${corrections}`,
        performed_by: "Guest Portal",
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0d0603] text-[#f5ede0]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0603]/90 backdrop-blur-md border-b border-[#c9a84c]/20">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-[#c9a84c] text-[10px] uppercase tracking-[0.25em] font-sans">Royal Palace</span>
            <span className="text-[#f5ede0] text-sm font-semibold tracking-wider">Warri Kingdom</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className={`text-xs uppercase tracking-[0.2em] font-sans transition-colors ${l.href === "/itinerary" ? "text-[#c9a84c]" : "text-[#f5ede0]/70 hover:text-[#c9a84c]"}`}>{l.label}</Link>
            ))}
          </div>
          <button className="md:hidden text-[#f5ede0]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#0d0603] border-t border-[#c9a84c]/20 px-6 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} onClick={() => setMenuOpen(false)} className="block text-[#f5ede0]/70 hover:text-[#c9a84c] text-sm uppercase tracking-widest font-sans">{l.label}</Link>
            ))}
          </div>
        )}
      </nav>

      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
        {!guest ? (
          <div className="text-center">
            <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-3">Guest Portal</p>
            <h1 className="text-4xl font-semibold text-[#f5ede0] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your Itinerary</h1>
            <p className="text-[#f5ede0]/50 text-sm font-sans mb-10 leading-relaxed">Enter your Admission Token from your official invitation to access and update your guest details.</p>
            <form onSubmit={(e) => { e.preventDefault(); lookupGuest(tokenInput); }} className="space-y-4 max-w-sm mx-auto">
              <input
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Admission Token (e.g. X4KR2TBW9A)"
                maxLength={10}
                className="w-full bg-[#1a0a06] border border-[#c9a84c]/30 text-[#f5ede0] placeholder:text-[#f5ede0]/30 rounded-lg px-4 py-3 text-center font-mono tracking-widest focus:outline-none focus:border-[#c9a84c]/70 text-sm"
              />
              {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-[#0d0603] font-bold py-3 rounded-lg font-sans text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Verifying..." : "Access My Details"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Guest Header */}
            <div className="text-center mb-8">
              <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-2">Welcome</p>
              <h1 className="text-3xl font-semibold text-[#f5ede0] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {guest.formal_salutation} {guest.full_name}
              </h1>
              {guest.official_title && <p className="text-[#f5ede0]/50 text-sm font-sans">{guest.official_title}</p>}
              <div className="mt-3 inline-block bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full px-4 py-1 text-[#c9a84c] font-mono text-xs tracking-widest">{guest.qr_code}</div>
            </div>

            {/* RSVP */}
            <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-xl p-5 mb-6">
              <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans mb-3">RSVP Confirmation</p>
              <div className="grid grid-cols-3 gap-2">
                {["Accepted", "Declined", "Proxy"].map((opt) => (
                  <button key={opt} onClick={() => setForm(p => ({ ...p, rsvp_status: opt }))}
                    className={`py-2.5 px-3 rounded-lg text-sm border transition-all font-medium font-sans ${form.rsvp_status === opt ? "bg-[#c9a84c] text-[#1a0a06] border-[#c9a84c]" : "bg-transparent text-[#f5ede0]/70 border-[#c9a84c]/20 hover:border-[#c9a84c]/50"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Fields */}
            <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-xl p-5 mb-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Edit3 className="w-4 h-4 text-[#c9a84c]" />
                <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans">Update Your Details</p>
              </div>
              {/* Locked fields */}
              <div className="grid grid-cols-1 gap-3 pb-4 mb-4 border-b border-[#c9a84c]/10">
                <p className="text-[#f5ede0]/30 text-[10px] uppercase tracking-wider font-sans flex items-center gap-1"><Lock className="w-3 h-3" /> Registered Details (locked)</p>
                <div>
                  <p className="text-[#f5ede0]/30 text-[10px] font-sans uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-[#f5ede0]/60 text-sm font-sans bg-[#0d0603]/50 rounded px-3 py-2">{guest.full_name}</p>
                </div>
              </div>
              {/* Editable fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(FIELD_LABELS).map(([key, label]) => {
                  const isLocked = !!(guest[key] && String(guest[key]).trim() !== "");
                  return (
                    <div key={key}>
                      <label className="text-[#f5ede0]/50 text-[10px] uppercase tracking-wider font-sans block mb-1 flex items-center gap-1">
                        {label} {isLocked && <Lock className="w-2.5 h-2.5 text-[#c9a84c]/40" />}
                      </label>
                      <input
                        value={form[key] || ""}
                        onChange={(e) => !isLocked && setForm(p => ({ ...p, [key]: e.target.value }))}
                        readOnly={isLocked}
                        className={`w-full border rounded-lg px-3 py-2 text-sm font-sans focus:outline-none ${
                          isLocked
                            ? "bg-[#0d0603]/50 border-[#c9a84c]/10 text-[#f5ede0]/40 cursor-not-allowed"
                            : "bg-[#0d0603] border-[#c9a84c]/15 text-[#f5ede0] focus:border-[#c9a84c]/50"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-xl p-5 mb-6">
              <label className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans block mb-3">Comments / Corrections Request</label>
              <p className="text-[#f5ede0]/40 text-xs font-sans mb-3">If any registered details need correction (name spelling, title, category), please describe below. The Protocol Office will action your request.</p>
              <textarea
                value={corrections}
                onChange={(e) => setCorrections(e.target.value)}
                rows={3}
                placeholder="e.g. Please update my official title to... / My name should read..."
                className="w-full bg-[#0d0603] border border-[#c9a84c]/15 text-[#f5ede0] placeholder:text-[#f5ede0]/20 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-[#c9a84c]/50 resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-[#0d0603] font-bold py-3 rounded-lg font-sans text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : null}
              {saving ? "Saving..." : saved ? "Changes Saved!" : "Save My Details"}
            </button>
          </div>
        )}
      </div>

      <footer className="border-t border-[#c9a84c]/10 py-8 text-center px-6">
        <p className="text-[#f5ede0]/30 text-xs font-sans tracking-wider">© 2026 Royal Guest Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}