import { Link } from "react-router-dom";
import { Menu, X, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Itinerary", href: "/itinerary" },
  { label: "Contact", href: "/contact" },
];

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "protocol@warrikingdom.org",
        subject: `Contact Form: ${form.name}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`,
        from_name: "Royal Guest Portal - Contact Form",
      });
    } catch { /* silent */ }
    setSent(true);
    setSending(false);
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
              <Link key={l.href} to={l.href} className={`text-xs uppercase tracking-[0.2em] font-sans transition-colors ${l.href === "/contact" ? "text-[#c9a84c]" : "text-[#f5ede0]/70 hover:text-[#c9a84c]"}`}>
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

      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-3">Get In Touch</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#f5ede0]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Contact the Protocol Office</h1>
          <div className="w-16 h-px bg-[#c9a84c]/50 mx-auto mt-4" />
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans mb-6">Address & Details</p>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "Address", value: "Royal Protocol Office\nAghofen, Warri Kingdom\nDelta State, Nigeria" },
                  { icon: Phone, label: "Telephone", value: "+234 (0) 800 000 0000" },
                  { icon: Mail, label: "Email", value: "protocol@warrikingdom.org" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1a0a06] border border-[#c9a84c]/30 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#c9a84c]" />
                    </div>
                    <div>
                      <p className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-sans mb-1">{label}</p>
                      <p className="text-[#f5ede0]/70 text-sm font-sans whitespace-pre-line">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-xl p-5">
              <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans mb-2">Note</p>
              <p className="text-[#f5ede0]/50 text-xs font-sans leading-relaxed">For guest invitation enquiries, please have your invitation reference or your full registered name ready when contacting us.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-2xl p-6 sm:p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-[#c9a84c]" />
                </div>
                <h3 className="font-semibold text-[#f5ede0] text-lg mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Message Received</h3>
                <p className="text-[#f5ede0]/50 text-sm font-sans">The Protocol Office will respond within 2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans mb-4">Send a Message</p>
                {[
                  { key: "name", label: "Full Name", type: "text", required: true },
                  { key: "email", label: "Email Address", type: "email", required: true },
                  { key: "phone", label: "Phone Number", type: "tel" },
                ].map(({ key, label, type, required }) => (
                  <div key={key}>
                    <label className="text-[#f5ede0]/50 text-[10px] uppercase tracking-wider font-sans block mb-1">{label}</label>
                    <input
                      type={type}
                      required={required}
                      value={form[key]}
                      onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full bg-[#0d0603] border border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/20 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#c9a84c]/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[#f5ede0]/50 text-[10px] uppercase tracking-wider font-sans block mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full bg-[#0d0603] border border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/20 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#c9a84c]/50 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-[#0d0603] font-bold py-3 rounded-lg font-sans text-sm uppercase tracking-widest transition-colors"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-[#c9a84c]/10 py-8 text-center px-6">
        <p className="text-[#f5ede0]/30 text-xs font-sans tracking-wider">© 2026 Royal Guest Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}