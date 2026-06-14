import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Menu, X, Facebook, Instagram, Twitter, Linkedin, ExternalLink } from "lucide-react";
import RoyalCrest from "../components/layout/RoyalCrest";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Itinerary", href: "/itinerary" },
  { label: "Itsekiris", href: "/itsekiris" },
  { label: "Directory", href: "/directory" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Contact", href: "/contact" },
];

const REACTIONS = [
  { key: "reactions_love", emoji: "❤️", label: "Love" },
  { key: "reactions_like", emoji: "👍🏼", label: "Like" },
  { key: "reactions_thumbsup", emoji: "🤜🏼", label: "Thumbs Up" },
  { key: "reactions_wow", emoji: "😮", label: "Wow" },
  { key: "reactions_omg", emoji: "🤯", label: "OMG" },
];

function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return local.slice(0, 2) + "***@" + domain;
}

function maskPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.slice(0, 4) + "****" + digits.slice(-3);
}

function PersonCard({ person, onReact, myReaction }) {
  const total = REACTIONS.reduce((sum, r) => sum + (person[r.key] || 0), 0);

  return (
    <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-xl overflow-hidden hover:border-[#c9a84c]/50 transition-all duration-200">
      <div className="p-5">
        <div className="flex gap-4 items-start mb-4">
          {person.photo_url ? (
            <img src={person.photo_url} alt={person.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-[#c9a84c]/30 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 border-2 border-[#c9a84c]/20 flex items-center justify-center shrink-0">
              <span className="text-[#c9a84c] text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {person.full_name?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[#f5ede0] font-semibold text-base leading-snug mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{person.full_name}</h3>
            {person.profession && <p className="text-[#c9a84c] text-xs font-sans uppercase tracking-wider">{person.profession}</p>}
            {person.category_name && <p className="text-[#f5ede0]/40 text-[10px] font-sans uppercase tracking-wider mt-0.5">{person.category_name}</p>}
          </div>
        </div>

        {person.show_bio && person.bio && (
          <p className="text-[#f5ede0]/60 text-sm font-sans leading-relaxed mb-4 line-clamp-3">{person.bio}</p>
        )}

        <div className="space-y-1.5 mb-4">
          {person.show_email && person.email && (
            <p className="text-[#f5ede0]/50 text-xs font-mono">✉ {maskEmail(person.email)}</p>
          )}
          {person.show_phone && person.phone && (
            <p className="text-[#f5ede0]/50 text-xs font-mono">📞 {maskPhone(person.phone)}</p>
          )}
        </div>

        {person.show_social && (
          <div className="flex gap-3 mb-4">
            {person.social_facebook && <a href={person.social_facebook} target="_blank" rel="noreferrer" className="text-[#f5ede0]/30 hover:text-[#c9a84c] transition-colors"><Facebook className="w-4 h-4" /></a>}
            {person.social_instagram && <a href={person.social_instagram} target="_blank" rel="noreferrer" className="text-[#f5ede0]/30 hover:text-[#c9a84c] transition-colors"><Instagram className="w-4 h-4" /></a>}
            {person.social_twitter && <a href={person.social_twitter} target="_blank" rel="noreferrer" className="text-[#f5ede0]/30 hover:text-[#c9a84c] transition-colors"><Twitter className="w-4 h-4" /></a>}
            {person.social_linkedin && <a href={person.social_linkedin} target="_blank" rel="noreferrer" className="text-[#f5ede0]/30 hover:text-[#c9a84c] transition-colors"><Linkedin className="w-4 h-4" /></a>}
          </div>
        )}

        {/* Reactions */}
        <div className="border-t border-[#c9a84c]/10 pt-3">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[#f5ede0]/30 text-[10px] font-sans uppercase tracking-wider">{total} reaction{total !== 1 ? "s" : ""}</span>
            {myReaction && <span className="text-[#c9a84c] text-[10px] font-sans ml-1">· you reacted</span>}
          </div>
          <div className="flex gap-1 flex-wrap">
            {REACTIONS.map((r) => {
              const isActive = myReaction === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => onReact(person.id, r.key)}
                  className={`flex items-center gap-1 border rounded-full px-2.5 py-1 transition-all ${isActive ? "bg-[#c9a84c]/20 border-[#c9a84c]/60 scale-110" : "bg-[#0d0603] hover:bg-[#c9a84c]/10 border-[#c9a84c]/10 hover:border-[#c9a84c]/40"}`}
                  title={isActive ? `Your reaction — click another to switch` : r.label}
                >
                  <span className="text-sm">{r.emoji}</span>
                  <span className={`text-[10px] font-sans tabular-nums ${isActive ? "text-[#c9a84c]" : "text-[#f5ede0]/50"}`}>{person[r.key] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Returns a stable visitor ID stored in localStorage
function getVisitorId() {
  let vid = localStorage.getItem("itsekiri_vid");
  if (!vid) {
    vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("itsekiri_vid", vid);
  }
  return vid;
}

// Storage key for all reactions: { [personId]: reactionKey }
const REACTIONS_STORAGE_KEY = "itsekiri_reactions";

function getStoredReactions() {
  try { return JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || "{}"); } catch { return {}; }
}

function setStoredReaction(personId, reactionKey) {
  const stored = getStoredReactions();
  stored[personId] = reactionKey;
  localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(stored));
}

export default function ItsekirisPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [persons, setPersons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [myReactions, setMyReactions] = useState({});

  useEffect(() => {
    setMyReactions(getStoredReactions());
    Promise.all([
      base44.entities.ItsekiriPerson.filter({ is_active: true }),
      base44.entities.ItsekiriCategory.filter({ is_active: true }, "sort_order", 50),
    ]).then(([p, c]) => {
      setPersons(p);
      setCategories(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleReact = async (personId, reactionKey) => {
    const person = persons.find((p) => p.id === personId);
    if (!person) return;

    const prevReaction = myReactions[personId];
    if (prevReaction === reactionKey) return; // already reacted with this — no double counting

    const updates = { [reactionKey]: (person[reactionKey] || 0) + 1 };
    // Remove from previous reaction if switching
    if (prevReaction) {
      updates[prevReaction] = Math.max(0, (person[prevReaction] || 0) - 1);
    }

    setMyReactions((prev) => ({ ...prev, [personId]: reactionKey }));
    setStoredReaction(personId, reactionKey);
    setPersons((prev) => prev.map((p) => p.id === personId ? { ...p, ...updates } : p));
    await base44.entities.ItsekiriPerson.update(personId, updates);
  };

  const filtered = persons.filter((p) => {
    const matchSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.profession?.toLowerCase().includes(search.toLowerCase()) ||
      p.bio?.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category_id === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#0d0603] text-[#f5ede0]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0603]/90 backdrop-blur-md border-b border-[#c9a84c]/20">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/"><RoyalCrest size="md" /></Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className={`text-xs uppercase tracking-[0.2em] font-sans transition-colors ${l.href === "/itsekiris" ? "text-[#c9a84c]" : "text-[#f5ede0]/70 hover:text-[#c9a84c]"}`}>{l.label}</Link>
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

      {/* Hero */}
      <div className="pt-24 pb-10 px-6 text-center">
        <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-3">People of the Kingdom</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#f5ede0] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Itsekiri Directory</h1>
        <p className="text-[#f5ede0]/50 text-sm font-sans max-w-xl mx-auto">Celebrating Itsekiri professionals, academics, leaders, and achievers across the world.</p>
        <div className="w-16 h-px bg-[#c9a84c]/50 mx-auto mt-6" />
      </div>

      {/* Filters */}
      <div className="px-6 pb-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a84c]/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, profession, category..."
              className="w-full bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 rounded-lg pl-10 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#c9a84c]/50"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider border transition-all ${selectedCategory === "all" ? "bg-[#c9a84c] text-[#0d0603] border-[#c9a84c]" : "bg-transparent text-[#f5ede0]/60 border-[#c9a84c]/20 hover:border-[#c9a84c]/50"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider border transition-all ${selectedCategory === cat.id ? "bg-[#c9a84c] text-[#0d0603] border-[#c9a84c]" : "bg-transparent text-[#f5ede0]/60 border-[#c9a84c]/20 hover:border-[#c9a84c]/50"}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#f5ede0]/30 font-sans text-sm">No profiles found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <PersonCard key={p.id} person={p} onReact={handleReact} myReaction={myReactions[p.id]} />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#c9a84c]/10 py-8 text-center px-6 mt-10">
        <p className="text-[#f5ede0]/30 text-xs font-sans tracking-wider">© 2026 Royal Guest Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}