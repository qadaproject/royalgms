import { Link } from "react-router-dom";
import { MapPin, Star, Phone, Navigation, ExternalLink } from "lucide-react";

const PRICE_COLORS = { "₦": "text-emerald-400", "₦₦": "text-yellow-400", "₦₦₦": "text-orange-400", "₦₦₦₦": "text-red-400" };

const FEATURE_ICONS = {
  "WiFi": "📶", "Pool": "🏊", "Gym": "🏋️", "Parking": "🅿️", "Free Parking": "🅿️",
  "Breakfast": "🍳", "Free Breakfast": "🍳", "AC": "❄️", "Bar": "🍹",
  "Restaurant": "🍽️", "Spa": "💆", "Generator": "⚡", "CCTV": "📹",
};

export default function DirectoryListingRow({ listing, userLocation, getDistance }) {
  const dist = listing.latitude && userLocation ? getDistance(userLocation.lat, userLocation.lng, listing.latitude, listing.longitude) : null;
  const detailUrl = `/directory/listing?id=${listing.id}`;

  const mapsUrl = listing.google_maps_url ||
    (listing.latitude ? `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}` : null);

  return (
    <div className="bg-[#1a0a06] border border-[#c9a84c]/10 rounded-xl overflow-hidden hover:border-[#c9a84c]/30 transition-all group flex gap-0">
      {/* Thumbnail */}
      <div className="w-28 sm:w-36 shrink-0 bg-[#0d0603] relative overflow-hidden">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🏢</div>
        )}
        {listing.is_featured && (
          <span className="absolute top-2 left-2 bg-[#c9a84c] text-[#0d0603] text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded font-sans">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-[#f5ede0] font-semibold text-sm sm:text-base leading-tight group-hover:text-[#c9a84c] transition-colors truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {listing.name}
              </h3>
              <p className="text-[#c9a84c]/70 text-[10px] uppercase tracking-widest font-sans">{listing.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {listing.price_range && (
                <span className={`text-sm font-bold ${PRICE_COLORS[listing.price_range] || "text-[#c9a84c]"}`}>{listing.price_range}</span>
              )}
              {listing.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#c9a84c] fill-[#c9a84c]" />
                  <span className="text-[#c9a84c] text-xs font-bold">{listing.rating}</span>
                  {listing.review_count > 0 && <span className="text-[#f5ede0]/30 text-[10px] font-sans">({listing.review_count})</span>}
                </div>
              )}
            </div>
          </div>

          {listing.address && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3 h-3 text-[#f5ede0]/30 shrink-0" />
              <p className="text-[#f5ede0]/40 text-xs font-sans truncate">{listing.address}</p>
              {dist && <span className="text-[#c9a84c]/50 text-[10px] font-sans shrink-0">· {dist}km</span>}
            </div>
          )}

          {/* Features */}
          {listing.features?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {listing.features.slice(0, 5).map(f => (
                <span key={f} className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#c9a84c]/10 text-[#c9a84c]/70 border border-[#c9a84c]/15">
                  {FEATURE_ICONS[f] || "•"} {f}
                </span>
              ))}
              {listing.features.length > 5 && (
                <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#c9a84c]/5 text-[#f5ede0]/30">+{listing.features.length - 5}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link to={detailUrl} className="text-center bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/20 text-[#c9a84c] text-xs px-3 py-1.5 rounded-lg font-sans transition-colors">
            View Details
          </Link>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="px-3 border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 text-[#f5ede0]/40 hover:text-[#c9a84c] text-xs py-1.5 rounded-lg font-sans transition-colors flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Maps
            </a>
          )}
          {listing.phone && (
            <a href={`tel:${listing.phone}`}
              className="px-3 border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 text-[#f5ede0]/40 hover:text-[#c9a84c] text-xs py-1.5 rounded-lg font-sans transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}