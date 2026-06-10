import { Link } from "react-router-dom";
import { MapPin, Star, Phone, Navigation, ExternalLink } from "lucide-react";

const PRICE_COLORS = { "₦": "text-emerald-400", "₦₦": "text-yellow-400", "₦₦₦": "text-orange-400", "₦₦₦₦": "text-red-400" };

const FEATURE_ICONS = {
  "WiFi": "📶", "Pool": "🏊", "Gym": "🏋️", "Parking": "🅿️", "Free Parking": "🅿️",
  "Breakfast": "🍳", "Free Breakfast": "🍳", "AC": "❄️", "Bar": "🍹",
  "Restaurant": "🍽️", "Spa": "💆", "Generator": "⚡", "CCTV": "📹",
};

export default function DirectoryListingCard({ listing, userLocation, getDistance }) {
  const dist = listing.latitude && userLocation ? getDistance(userLocation.lat, userLocation.lng, listing.latitude, listing.longitude) : null;
  const detailUrl = `/directory/listing?id=${listing.id}`;

  const mapsUrl = listing.google_maps_url ||
    (listing.latitude ? `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}` : null);

  return (
    <div className="bg-[#1a0a06] border border-[#c9a84c]/10 rounded-xl overflow-hidden hover:border-[#c9a84c]/30 transition-all group">
      {/* Photo */}
      <div className="h-40 bg-[#0d0603] relative overflow-hidden">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#1a0a06] to-[#0d0603]">
            🏢
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0603]/80 to-transparent" />
        {listing.is_featured && (
          <span className="absolute top-2 left-2 bg-[#c9a84c] text-[#0d0603] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-sans">Featured</span>
        )}
        {listing.price_range && (
          <span className={`absolute top-2 right-2 text-sm font-bold ${PRICE_COLORS[listing.price_range] || "text-[#c9a84c]"}`}>
            {listing.price_range}
          </span>
        )}
        {listing.open_now !== undefined && (
          <span className={`absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-sans ${listing.open_now ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            {listing.open_now ? "Open" : "Closed"}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1">
          <h3 className="text-[#f5ede0] font-semibold text-base leading-tight group-hover:text-[#c9a84c] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {listing.name}
          </h3>
          {listing.category && (
            <p className="text-[#c9a84c]/70 text-[10px] uppercase tracking-widest font-sans mt-0.5">{listing.category}</p>
          )}
        </div>

        {listing.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-[#c9a84c] fill-[#c9a84c]" />
            <span className="text-[#c9a84c] text-sm font-bold">{listing.rating}</span>
            {listing.review_count > 0 && <span className="text-[#f5ede0]/30 text-xs font-sans">({listing.review_count})</span>}
          </div>
        )}

        {listing.address && (
          <div className="flex items-start gap-1.5 mb-3">
            <MapPin className="w-3 h-3 text-[#f5ede0]/30 shrink-0 mt-0.5" />
            <p className="text-[#f5ede0]/40 text-xs font-sans line-clamp-2">{listing.address}</p>
          </div>
        )}

        {dist && (
          <div className="flex items-center gap-1.5 mb-2">
            <Navigation className="w-3 h-3 text-[#c9a84c]/50" />
            <span className="text-[#c9a84c]/70 text-xs font-sans">{dist} km away</span>
          </div>
        )}

        {/* Features */}
        {listing.features?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.features.slice(0, 4).map(f => (
              <span key={f} className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#c9a84c]/10 text-[#c9a84c]/70 border border-[#c9a84c]/15">
                {FEATURE_ICONS[f] || "•"} {f}
              </span>
            ))}
            {listing.features.length > 4 && (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#c9a84c]/5 text-[#f5ede0]/30">+{listing.features.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Link to={detailUrl} className="flex-1 text-center bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/20 text-[#c9a84c] text-xs py-2 rounded-lg font-sans transition-colors">
            View Details
          </Link>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="px-3 border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 text-[#f5ede0]/40 hover:text-[#c9a84c] text-xs py-2 rounded-lg font-sans transition-colors flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {listing.phone && (
            <a href={`tel:${listing.phone}`}
              className="px-3 border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 text-[#f5ede0]/40 hover:text-[#c9a84c] text-xs py-2 rounded-lg font-sans transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}