import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, BadgeCheck } from "lucide-react";
import StarRating from "./StarRating";

// Mirrors the same threshold logic used in VendorDashboardPage
const isTopRated = (vendor) =>
  (vendor.average_rating >= 4.5 && vendor.review_count >= 3);

const priceRangeColor = {
  Budget: "text-emerald-600",
  "Mid-range": "text-blue-600",
  Premium: "text-amber-600",
  Luxury: "text-purple-600",
};

export default function VendorCard({ vendor, featured = false }) {
  return (
    <Link to={vendor.marketplace_username ? `/marketplace/vendor/${vendor.marketplace_username}` : `/marketplace/vendor/detail?id=${vendor.id}`} className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {vendor.cover_image_url ? (
          <img src={vendor.cover_image_url} alt={vendor.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-secondary to-muted">
            {vendor.category_name?.[0] || "🏪"}
          </div>
        )}
        {featured && vendor.featured && (
          <Badge className="absolute top-2 left-2 text-[9px] bg-accent text-accent-foreground shadow-sm">⭐ Featured</Badge>
        )}
        {isTopRated(vendor) && (
          <Badge className="absolute bottom-2 left-2 text-[9px] bg-amber-500 text-white shadow-sm flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5" /> Top Rated
          </Badge>
        )}
        {vendor.price_range && (
          <Badge variant="secondary" className={`absolute top-2 right-2 text-[9px] ${priceRangeColor[vendor.price_range]}`}>
            {vendor.price_range}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          {vendor.logo_url && (
            <img src={vendor.logo_url} alt="Logo" className="w-9 h-9 rounded-lg object-cover border border-border shrink-0 -mt-6 relative shadow-sm bg-card" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate flex items-center gap-1">
              {vendor.verified_badge_enabled !== false && <BadgeCheck className="w-3.5 h-3.5 shrink-0 fill-amber-400 text-white" />}
              {vendor.business_name}
            </p>
            <Badge variant="outline" className="text-[9px] mt-0.5">{vendor.category_name}</Badge>
          </div>
        </div>
        {vendor.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{vendor.description}</p>
        )}
        <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
          <div className="flex items-center gap-1">
            <StarRating rating={vendor.average_rating || 0} size="xs" />
            {vendor.review_count > 0 && <span className="text-[10px] text-muted-foreground">({vendor.review_count})</span>}
          </div>
          {vendor.location_city && (
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              <span>{vendor.location_city}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}