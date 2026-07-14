import RoyalCrest from "@/components/layout/RoyalCrest";

export default function InvitationCard({ guest, settings }) {
  const inviteUrl = `${window.location.origin}/invite-detail?token=${guest.qr_code}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inviteUrl)}`;
  const guestName = [guest.formal_salutation, guest.full_name, guest.post_nominals ? `, ${guest.post_nominals}` : ""].filter(Boolean).join(" ");

  return (
    <div
      className="invite-card relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, #6b1a12 0%, #3d0a06 40%, #4a0808 100%)",
        border: "2px solid #c9a84c",
      }}
    >
      {/* Gold corner brackets */}
      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#c9a84c] rounded-tl-sm" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#c9a84c] rounded-tr-sm" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#c9a84c] rounded-bl-sm" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#c9a84c] rounded-br-sm" />

      <div className="px-10 py-10 text-center">
        {/* Crest */}
        <div className="flex justify-center mb-4">
          <RoyalCrest size="lg" />
        </div>

        {/* His Majesty line */}
        <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.35em] mb-1">His Majesty</p>
        <p className="font-heading text-xl font-semibold text-[#f5ede0] leading-snug">
          Ògíame Atúwàtse III, CFR,
        </p>
        <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.25em] mb-4">The Olu of Warri,</p>

        <p className="text-[#f5ede0]/70 text-xs italic tracking-[0.2em] uppercase mb-5">Formally Invites</p>

        {/* Guest Name */}
        <p className="font-heading text-2xl font-bold text-[#f5ede0] leading-tight mb-1">
          {guestName}
        </p>
        {guest.official_title && (
          <p className="text-[#c9a84c]/80 text-sm italic mb-4">{guest.official_title}</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 justify-center">
          <div className="flex-1 h-px bg-[#c9a84c]/30 max-w-[60px]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/50" />
          <div className="flex-1 h-px bg-[#c9a84c]/30 max-w-[60px]" />
        </div>

        <p className="text-[#c9a84c]/70 text-[10px] uppercase tracking-[0.3em] mb-1">To The</p>
        <p className="font-heading text-2xl font-bold text-[#c9a84c] uppercase tracking-wide leading-tight mb-1">
          {settings?.event_name || "5th Coronation Anniversary"}
        </p>
        <p className="text-[#c9a84c]/70 text-[10px] uppercase tracking-[0.3em] mb-1">Of</p>
        <p className="text-[#f5ede0]/50 text-xs mb-6">
          {settings?.event_subtitle || "Ogiame Atuwatse III, Olu of Warri Kingdom"}
        </p>

        {/* Details Table */}
        <div
          className="rounded-lg mb-6 text-left overflow-hidden"
          style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          {[
            {
              label: "DATE",
              value: settings?.event_date
                ? new Date(settings.event_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""
            },
            { label: "VENUE", value: settings?.venue_name || settings?.venue_address },
            { label: "TIME", value: settings?.event_time },
          ].filter(d => d.value).map((row, i, arr) => (
            <div key={row.label} className={`flex items-start gap-4 px-5 py-2.5 ${i < arr.length - 1 ? "border-b border-[#c9a84c]/10" : ""}`}>
              <span className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-[0.2em] w-12 shrink-0 pt-0.5">{row.label}</span>
              <span className="text-[#f5ede0] text-sm">{row.value}</span>
            </div>
          ))}
          {/* Category + Seating divider row */}
          <div className="border-t border-[#c9a84c]/20 grid grid-cols-2">
            <div className="px-5 py-3 border-r border-[#c9a84c]/10">
              <p className="text-[#c9a84c] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Category</p>
              <p className="text-[#f5ede0] text-sm">{guest.category || "—"}</p>
            </div>
            <div className="px-5 py-3">
              <p className="text-[#c9a84c] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Seating Zone</p>
              <p className="text-[#f5ede0] text-sm">{guest.seating_zone || "To be assigned"}</p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-3">
          <div className="bg-white p-3 rounded-xl">
            <img
              src={qrSrc}
              alt="QR"
              className="w-36 h-36"
            />
          </div>
        </div>
        <p className="text-[#f5ede0]/40 text-[9px] uppercase tracking-[0.3em] mb-1">Scan to View Invitation</p>
        <p className="text-[#c9a84c] font-mono font-bold text-lg tracking-[0.3em] mb-6">{guest.qr_code}</p>

        {/* Footer note */}
        <p className="text-[#f5ede0]/30 text-[10px] italic">
          {settings?.footer_note || "This invitation is non-transferable. Please present upon arrival at the security checkpoint."}
        </p>
      </div>
    </div>
  );
}