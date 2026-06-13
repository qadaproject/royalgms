import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import RoyalCrest from "./RoyalCrest";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Itinerary", href: "/itinerary" },
  { label: "Contact", href: "/contact" },
  { label: "Directory", href: "/directory" },
  { label: "Marketplace", href: "/marketplace" },
];

export default function PublicNav({ activePath }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0603]/90 backdrop-blur-md border-b border-[#c9a84c]/20">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <RoyalCrest size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`text-xs uppercase tracking-[0.2em] font-sans transition-colors ${
                l.href === activePath ? "text-[#c9a84c]" : "text-[#f5ede0]/70 hover:text-[#c9a84c]"
              }`}
            >
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
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-[#f5ede0]/70 hover:text-[#c9a84c] text-sm uppercase tracking-widest font-sans"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}