import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Phone, Globe, Mail, ArrowLeft, Facebook, Instagram, Twitter, MessageCircle, Clock, Tag, ChevronLeft, ChevronRight, BadgeCheck, Eye, Copy, Check } from "lucide-react";

function RevealCallButton({ phone }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!revealed) {
    return (
      <Button className="w-full" size="sm" onClick={() => setRevealed(true)}>
        <Eye className="w-4 h-4 mr-2" />Reveal & Call
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button asChild className="flex-1" size="sm">
        <a href={`tel:${phone}`}><Phone className="w-4 h-4 mr-2" />{phone}</a>
      </Button>
      <Button variant="outline" size="sm" className="px-3" title="Copy"
        onClick={() => { navigator.clipboard.writeText(phone); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

function MaskedPhone({ phone }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = phone.length > 6
    ? phone.slice(0, 4) + "****" + phone.slice(-3)
    : phone.slice(0, 2) + "****";

  const copyPhone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!revealed) {
    return (
      <button
        onClick={() => setRevealed(true)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
        title="Click to reveal number"
      >
        <span className="font-mono tracking-wider">{masked}</span>
        <span className="flex items-center gap-0.5 text-xs text-primary group-hover:underline">
          <Eye className="w-3 h-3" /> Reveal
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a href={`tel:${phone}`} className="font-mono tracking-wider text-foreground hover:text-primary transition-colors">
        {phone}
      </a>
      <button onClick={copyPhone} className="text-muted-foreground hover:text-primary transition-colors" title="Copy number">
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import StarRating from "../components/marketplace/StarRating";
import ProductCard from "../components/marketplace/ProductCard";
import { toast } from "sonner";

export default function VendorDetailPage() {
  const { username } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const vendorId = urlParams.get("id");
  const queryClient = useQueryClient();
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", reviewer_email: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: vendor } = useQuery({
    queryKey: ["vendor", vendorId, username],
    queryFn: async () => {
      const results = username
        ? await base44.entities.Vendor.filter({ marketplace_username: username, approval_status: "Approved" })
        : await base44.entities.Vendor.filter({ id: vendorId });
      const v = results[0];
      if (v?.id) {
        // Increment profile view counter (fire-and-forget)
        base44.entities.Vendor.update(v.id, { profile_view_count: (v.profile_view_count || 0) + 1 }).catch(() => {});
      }
      return results;
    },
    select: d => d[0],
    enabled: !!(vendorId || username),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["vendor_products", vendor?.id],
    queryFn: () => base44.entities.VendorProduct.filter({ vendor_id: vendor?.id, is_available: true }),
    enabled: !!vendor?.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["vendor_reviews", vendor?.id],
    queryFn: () => base44.entities.VendorReview.filter({ vendor_id: vendor?.id, is_approved: true }),
    enabled: !!vendor?.id,
  });

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name || !reviewForm.comment) { toast.error("Please fill all required fields"); return; }
    setSubmitting(true);
    await base44.entities.VendorReview.create({
      ...reviewForm,
      vendor_id: vendor?.id,
      vendor_name: vendor?.business_name || "",
    });
    toast.success("Review submitted! It will appear after admin approval.");
    setReviewForm({ reviewer_name: "", reviewer_email: "", rating: 5, comment: "" });
    setSubmitting(false);
  };

  if (!vendor) return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
    </div>
  );

  const allImages = [vendor.cover_image_url, ...(vendor.gallery_urls || [])].filter(Boolean);

  const priceRangeColor = { Budget: "text-emerald-600", "Mid-range": "text-blue-600", Premium: "text-amber-600", Luxury: "text-purple-600" };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            {allImages.length > 0 ? (
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
                <img src={allImages[galleryIdx]} alt={vendor.business_name} className="w-full h-full object-cover" />
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setGalleryIdx(i => (i - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setGalleryIdx(i => (i + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === galleryIdx ? "bg-white" : "bg-white/50"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-muted aspect-video flex items-center justify-center">
                <span className="text-6xl">{vendor.category_name?.[0] || "🏪"}</span>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4">
              {vendor.logo_url && (
                <img src={vendor.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border shadow-sm shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {vendor.featured && <Badge className="bg-accent text-accent-foreground text-[10px]">⭐ Featured</Badge>}
                  <Badge variant="outline" className="text-[10px]">{vendor.category_name}</Badge>
                  {vendor.price_range && <span className={`text-xs font-semibold ${priceRangeColor[vendor.price_range] || ""}`}>{vendor.price_range}</span>}
                  {(vendor.average_rating >= 4.5 && vendor.review_count >= 3) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-2 py-0.5">
                      🏆 Top Rated
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-3xl font-semibold flex items-center gap-2">
                  {vendor.business_name}
                  {vendor.verified_badge_enabled !== false && (
                    <BadgeCheck className="w-7 h-7 shrink-0 fill-amber-400 text-white" title="Verified Vendor" />
                  )}
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={vendor.average_rating || 0} />
                  <span className="text-sm text-muted-foreground">({vendor.review_count || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-lg font-semibold mb-2">About</h2>
              <p className="text-muted-foreground leading-relaxed">{vendor.description || "No description provided."}</p>
            </div>

            {/* Services/Products */}
            {vendor.services_products && (
              <div>
                <h2 className="font-heading text-lg font-semibold mb-2">Services & Products</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{vendor.services_products}</p>
              </div>
            )}

            {/* Product Listings */}
            {products.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-semibold mb-4">Listings & Pricing</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} vendor={vendor} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-heading text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviews.map(r => (
                    <div key={r.id} className="border border-border rounded-xl p-4 bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{r.reviewer_name}</p>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              <div className="border border-border rounded-xl p-5 bg-card">
                <h3 className="font-heading text-base font-semibold mb-4">Leave a Review</h3>
                <form onSubmit={submitReview} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Your name *" value={reviewForm.reviewer_name} onChange={e => setReviewForm(f => ({ ...f, reviewer_name: e.target.value }))} />
                    <Input placeholder="Your email" value={reviewForm.reviewer_email} onChange={e => setReviewForm(f => ({ ...f, reviewer_email: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                        className={`text-xl transition-colors ${n <= reviewForm.rating ? "text-amber-400" : "text-muted-foreground/30"}`}>★</button>
                    ))}
                  </div>
                  <Textarea placeholder="Write your review... *" value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} className="h-24" />
                  <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Review"}</Button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="border border-border rounded-xl p-5 bg-card sticky top-4">
              <h3 className="font-heading text-base font-semibold mb-4">Contact & Info</h3>
              <div className="space-y-3 text-sm">
                {vendor.location_address && (
                  <div className="flex gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span>{vendor.location_address}{vendor.location_city ? `, ${vendor.location_city}` : ""}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex gap-2">
                    <Phone className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <MaskedPhone phone={vendor.phone} />
                  </div>
                )}
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="flex gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span className="break-all">{vendor.email}</span>
                  </a>
                )}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="flex gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Globe className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span className="break-all">{vendor.website}</span>
                  </a>
                )}
                {vendor.opening_hours && (
                  <div className="flex gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span>{vendor.opening_hours}</span>
                  </div>
                )}
              </div>

              {/* Social */}
              {(vendor.social_facebook || vendor.social_instagram || vendor.social_twitter || vendor.social_whatsapp) && (
                <div className="mt-4 pt-4 border-t border-border flex gap-3">
                  {vendor.social_facebook && <a href={vendor.social_facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:opacity-80"><Facebook className="w-5 h-5" /></a>}
                  {vendor.social_instagram && <a href={vendor.social_instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:opacity-80"><Instagram className="w-5 h-5" /></a>}
                  {vendor.social_twitter && <a href={vendor.social_twitter} target="_blank" rel="noreferrer" className="text-sky-500 hover:opacity-80"><Twitter className="w-5 h-5" /></a>}
                  {vendor.social_whatsapp && <a href={`https://wa.me/${vendor.social_whatsapp}`} target="_blank" rel="noreferrer" className="text-green-600 hover:opacity-80"><MessageCircle className="w-5 h-5" /></a>}
                </div>
              )}

              {/* Tags */}
              {vendor.tags?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.tags.map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px]"><Tag className="w-2.5 h-2.5 mr-1" />{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {vendor.social_whatsapp && (
                  <Button asChild variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50" size="sm">
                    <a href={`https://wa.me/${vendor.social_whatsapp}`} target="_blank" rel="noreferrer">
                      <MessageCircle className="w-4 h-4 mr-2" />WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}