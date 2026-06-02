import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Itinerary", href: "/itinerary" },
  { label: "Contact", href: "/contact" },
];

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
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
              <Link key={l.href} to={l.href} className={`text-xs uppercase tracking-[0.2em] font-sans transition-colors ${l.href === "/about" ? "text-[#c9a84c]" : "text-[#f5ede0]/70 hover:text-[#c9a84c]"}`}>
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
              <Link key={l.href} to={l.href} onClick={() => setMenuOpen(false)} className="block text-[#f5ede0]/70 hover:text-[#c9a84c] text-sm uppercase tracking-widest font-sans">{l.label}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="relative pt-16">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img src="https://atuwatseiii.com/images/slider/ogiame-throne-2.jpg" alt="Ogiame" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0603]/60 to-[#0d0603]" />
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-2">About the Event</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#f5ede0]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Global Homecoming</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* About Ogiame */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-4">His Majesty</p>
            <h2 className="text-3xl font-semibold text-[#f5ede0] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Ogiame Atuwatse III, CFR<br />The Olu of Warri</h2>
            <div className="space-y-4 text-[#f5ede0]/70 text-sm leading-relaxed font-sans">
              <p>His Majesty Ogiame Atuwatse III, CFR, the 21st Olu of Warri Kingdom, ascended the throne on August 21, 2021, ascending to become one of Nigeria's most respected and impactful traditional rulers.</p>
              <p>Born Solomon Emiko, His Majesty has championed development, cultural preservation, regional peace, and global diplomacy — positioning Warri Kingdom as a formidable voice on the world stage.</p>
              <p>He was decorated with the Commander of the Order of the Federal Republic (CFR) — one of Nigeria's highest national honours — in recognition of his exceptional contributions to national unity and development.</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#c9a84c]/20">
            <img src="https://atuwatseiii.com/images/slider/ogiame-throne-2.jpg" alt="Ogiame Atuwatse III" className="w-full object-cover" />
          </div>
        </div>

        {/* About the Event */}
        <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-2xl p-8 sm:p-12">
          <div className="w-10 h-px bg-[#c9a84c] mb-6" />
          <h2 className="text-3xl font-semibold text-[#f5ede0] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>5th Coronation Anniversary</h2>
          <div className="space-y-4 text-[#f5ede0]/70 text-sm leading-relaxed font-sans">
            <p>The 5th Coronation Anniversary of His Majesty Ogiame Atuwatse III, CFR marks five years of extraordinary leadership, cultural renaissance, and transformative development for Warri Kingdom and the Itsekiri nation.</p>
            <p>This Global Homecoming is a celebration that calls home all sons and daughters of Warri Kingdom, dignitaries, diplomats, and friends of the royal house to bear witness to an historic milestone.</p>
            <p>Over three days of cultural events, state ceremonies, and celebrations, the royal household and the entire Itsekiri nation will welcome the world to Aghofen — the seat of Warri Kingdom.</p>
          </div>
        </div>

        {/* Warri Kingdom */}
        <div className="text-center">
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-4">About</p>
          <h2 className="text-3xl font-semibold text-[#f5ede0] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Warri Kingdom</h2>
          <p className="text-[#f5ede0]/60 text-sm leading-relaxed font-sans max-w-2xl mx-auto">
            Warri Kingdom is one of the oldest and most historically significant kingdoms in the Niger Delta region of Nigeria. Home to the Itsekiri people, Warri Kingdom has a rich history of commerce, diplomacy, and cultural excellence that spans over five centuries.
          </p>
        </div>
      </div>

      <footer className="border-t border-[#c9a84c]/10 py-8 text-center px-6">
        <p className="text-[#f5ede0]/30 text-xs font-sans tracking-wider">© 2026 Royal Guest Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}