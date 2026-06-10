import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Globe, Star, Clock, Navigation, Flag, Edit2, ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FlagListingDialog from "@/components/directory/FlagListingDialog";
import ClaimListingDialog from "@/components/directory/ClaimListingDialog";

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? "text-[#c9a84c] fill-[#c9a84c]" : "text-[#f5ede0]/20"}`} />
      ))}
    </div>
  );
}

export default function DirectoryListingDetail() {
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get("id");
  const placeId = params.get("place_id");

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showFlag, setShowFlag] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }

    if (listingId) {
      base44.entities.DirectoryListing.filter({ id: listingId }).then(res => {
        setListing(res[0] || null);
        setLoading(false);
      });
    } else if (placeId) {
      base44.functions.invoke("placeDetails", { place_id: placeId }).then(res => {
        setListing(res.data?.place || null);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  function getDistance(lat2, lng2) {
    if (!userLocation || !lat2) return null;
    const R = 6371;
    const dLat = (lat2 - userLocation.lat) * Math.PI / 180;
    const dLng = (lng2 - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }

  const photos = listing?.gallery_urls?.length ? listing.gallery_urls : (listing?.photo_url ? [listing.photo_url] : []);
  const dist = listing ? getDistance(listing.latitude, listing.longitude) : null;
  const mapsUrl = listing?.maps_url || (listing?.latitude ? `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}` : null);

  if (loading) return (
    <div className="min-h-screen bg-[#0d0603] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-[#0d0603] flex flex-col items-center justify-center text-[#f5ede0]/50">
      <p className="mb-4">Listing not found.</p>
      <Link to="/directory" className="text-[#c9a84c] hover:underline text-sm">← Back to Directory</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0603] text-[#f5ede0]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0603]/95 backdrop-blur-md border-b border-[#c9a84c]/20">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/directory" className="flex items-center gap-2 text-[#f5ede0]/60 hover:text-[#c9a84c] text-sm font-sans">
            <ChevronLeft className="w-4 h-4" /> Directory
          </Link>
          <div className="flex gap-2">
            <Button onClick={() => setShowFlag(true)} size="sm" variant="ghost" className="text-[#f5ede0]/40 hover:text-red-400 text-xs gap-1">
              <Flag className="w-3 h-3" /> Report
            </Button>
            <Button onClick={() => setShowClaim(true)} size="sm" variant="ghost" className="text-[#c9a84c]/70 hover:text-[#c9a84c] text-xs gap-1">
              <Edit2 className="w-3 h-3" /> Claim / Update
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-14">
        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="relative h-64 sm:h-80 bg-[#1a0a06] overflow-hidden">
            <img src={photos[activePhoto]} alt={listing.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0603] to-transparent" />
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === activePhoto ? "bg-[#c9a84c]" : "bg-[#f5ede0]/30"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{listing.name}</h1>
                  {listing.price_range && (
                    <Badge className="bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30 shrink-0">{listing.price_range}</Badge>
                  )}
                </div>
                {listing.category && (
                  <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-sans mb-3">{listing.category}</p>
                )}
                {listing.rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <StarDisplay rating={listing.rating} />
                    <span className="text-[#c9a84c] font-bold">{listing.rating}</span>
                    {listing.review_count > 0 && <span className="text-[#f5ede0]/40 text-xs font-sans">({listing.review_count} reviews)</span>}
                  </div>
                )}
                {listing.description && (
                  <p className="text-[#f5ede0]/60 font-sans text-sm leading-relaxed">{listing.description}</p>
                )}
              </div>

              {listing.opening_hours && (
                <div className="bg-[#1a0a06] border border-[#c9a84c]/10 rounded-xl p-4">
                  <h3 className="text-[#c9a84c] text-xs uppercase tracking-widest font-sans mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Opening Hours
                  </h3>
                  <p className="text-[#f5ede0]/60 text-sm font-sans whitespace-pre-line">{listing.opening_hours.split(" | ").join("\n")}</p>
                </div>
              )}

              {listing.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map(t => (
                    <span key={t} className="bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0]/50 text-xs px-2.5 py-1 rounded-full font-sans">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Contact */}
              <div className="bg-[#1a0a06] border border-[#c9a84c]/10 rounded-xl p-5 space-y-3">
                <h3 className="text-[#c9a84c] text-xs uppercase tracking-widest font-sans mb-1">Contact & Location</h3>
                {listing.address && (
                  <div className="flex gap-3 items-start">
                    <MapPin className="w-4 h-4 text-[#c9a84c]/60 shrink-0 mt-0.5" />
                    <p className="text-[#f5ede0]/70 text-sm font-sans">{listing.address}</p>
                  </div>
                )}
                {dist && (
                  <div className="flex gap-3 items-center">
                    <Navigation className="w-4 h-4 text-[#c9a84c]/60 shrink-0" />
                    <p className="text-[#c9a84c] text-sm font-sans font-medium">{dist} km from you</p>
                  </div>
                )}
                {listing.phone && (
                  <div className="flex gap-3 items-center">
                    <Phone className="w-4 h-4 text-[#c9a84c]/60 shrink-0" />
                    <a href={`tel:${listing.phone}`} className="text-[#f5ede0]/70 text-sm font-sans hover:text-[#c9a84c]">{listing.phone}</a>
                  </div>
                )}
                {listing.website && (
                  <div className="flex gap-3 items-center">
                    <Globe className="w-4 h-4 text-[#c9a84c]/60 shrink-0" />
                    <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] text-sm font-sans hover:underline truncate">
                      {listing.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              {/* Directions */}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0603] font-bold py-3 rounded-xl font-sans text-sm transition-colors">
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
              )}

              {listing.phone && (
                <a href={`tel:${listing.phone}`}
                  className="flex items-center justify-center gap-2 w-full border border-[#c9a84c]/30 hover:border-[#c9a84c] text-[#c9a84c] py-3 rounded-xl font-sans text-sm transition-colors">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFlag && <FlagListingDialog listing={listing} onClose={() => setShowFlag(false)} />}
      {showClaim && <ClaimListingDialog listing={listing} onClose={() => setShowClaim(false)} />}
    </div>
  );
}