import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PublicNav from "@/components/layout/PublicNav";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Mail, Phone, Facebook, Instagram, Twitter, Linkedin, User } from "lucide-react";

function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  return local.slice(0, 2) + "***@" + domain;
}
function maskPhone(phone) {
  if (!phone) return "";
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}

function PersonCard({ person, settings }) {
  return (
    <div className="bg-white/5 border border-[#c9a84c]/15 rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:border-[#c9a84c]/40 transition-all">
      {settings?.show_photo !== false ? (
        person.photo_url ? (
          <img src={person.photo_url} alt={person.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-[#c9a84c]/30" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#c9a84c]/10 flex items-center justify-center border-2 border-[#c9a84c]/20">
            <User className="w-8 h-8 text-[#c9a84c]/50" />
          </div>
        )
      ) : null}

      <div>
        <h3 className="font-heading text-lg font-semibold text-[#f5ede0]">{person.full_name}</h3>
        <span className="text-xs text-[#c9a84c] uppercase tracking-wider">{person.category_name}</span>
      </div>

      {person.bio && (
        <p className="text-sm text-[#f5ede0]/60 line-clamp-3 leading-relaxed">{person.bio}</p>
      )}

      <div className="w-full space-y-1.5 mt-1">
        {settings?.show_location !== false && person.location && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#f5ede0]/50">
            <MapPin className="w-3 h-3" />{person.location}
          </div>
        )}
        {settings?.show_email !== false && person.email && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#f5ede0]/50">
            <Mail className="w-3 h-3" />
            {settings?.mask_email !== false ? maskEmail(person.email) : person.email}
          </div>
        )}
        {settings?.show_phone !== false && person.phone && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#f5ede0]/50">
            <Phone className="w-3 h-3" />
            {settings?.mask_phone !== false ? maskPhone(person.phone) : person.phone}
          </div>
        )}
      </div>

      {settings?.show_social !== false && (
        <div className="flex items-center gap-3 mt-1">
          {person.social_facebook && (
            <a href={person.social_facebook} target="_blank" rel="noopener noreferrer" className="text-[#f5ede0]/40 hover:text-[#c9a84c] transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          )}
          {person.social_instagram && (
            <a href={person.social_instagram} target="_blank" rel="noopener noreferrer" className="text-[#f5ede0]/40 hover:text-[#c9a84c] transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {person.social_twitter && (
            <a href={person.social_twitter} target="_blank" rel="noopener noreferrer" className="text-[#f5ede0]/40 hover:text-[#c9a84c] transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {person.social_linkedin && (
            <a href={person.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-[#f5ede0]/40 hover:text-[#c9a84c] transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function ItsekiriDirectory() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["itsekiri-categories"],
    queryFn: () => base44.entities.ItsekiriCategory.filter({ is_active: true }, "sort_order", 50),
  });

  const { data: persons = [] } = useQuery({
    queryKey: ["itsekiri-persons"],
    queryFn: () => base44.entities.ItsekiriPerson.filter({ is_active: true }, "full_name", 200),
  });

  const { data: settingsArr = [] } = useQuery({
    queryKey: ["itsekiri-settings"],
    queryFn: () => base44.entities.ItsekiriDirectorySettings.list(),
  });
  const settings = settingsArr[0] || {};

  const filtered = useMemo(() => {
    return persons.filter(p => {
      const matchCat = activeCategory === "all" || p.category_id === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.full_name?.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [persons, activeCategory, search]);

  return (
    <div className="min-h-screen bg-[#0d0603] text-[#f5ede0]">
      <PublicNav activePath="/itsekiris" />

      {/* Hero */}
      <div className="pt-28 pb-12 px-6 text-center">
        <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] mb-3">Who We Are</p>
        <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-4">Itsekiri People</h1>
        <div className="w-16 h-px bg-[#c9a84c]/40 mx-auto mb-4" />
        <p className="text-[#f5ede0]/60 text-sm max-w-xl mx-auto">
          A directory of distinguished Itsekiri sons and daughters across all professions and fields.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a84c]/50" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, profession, location..."
            className="pl-10 bg-white/5 border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:border-[#c9a84c]/50"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-sans transition-all border ${
              activeCategory === "all"
                ? "bg-[#c9a84c] text-[#1a0a06] border-[#c9a84c]"
                : "border-[#c9a84c]/30 text-[#f5ede0]/60 hover:border-[#c9a84c]/60"
            }`}
          >
            All ({persons.length})
          </button>
          {categories.map(cat => {
            const count = persons.filter(p => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-sans transition-all border ${
                  activeCategory === cat.id
                    ? "bg-[#c9a84c] text-[#1a0a06] border-[#c9a84c]"
                    : "border-[#c9a84c]/30 text-[#f5ede0]/60 hover:border-[#c9a84c]/60"
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="text-center text-[#f5ede0]/40 py-16">No results found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(p => (
              <PersonCard key={p.id} person={p} settings={settings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}