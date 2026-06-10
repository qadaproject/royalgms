import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Phone, Globe, Mail, ArrowLeft, Facebook, Instagram, Twitter, MessageCircle, Clock, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import StarRating from "../components/marketplace/StarRating";
import { toast } from "sonner";

export default function VendorDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const vendorId = params.get("id");
  const queryClient = useQueryClient();
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", reviewer_email: "", rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: vendor } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => base44.entities.Vendor.filter({ id: vendorId }),
    select: d => d[0],
    enabled: !!vendorId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["vendor_products", vendorId],
    queryFn: () => base44.entities.VendorProduct.filter({ vendor_id: vendorId, is_available: true }),
    enabled: !!vendorId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["vendor_reviews", vendorId],
    queryFn: () => base44.entities.VendorReview.filter({ vendor_id: vendorId, is_approved: true }),
    enabled: !!vendorId,
  });

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name || !reviewForm.comment) { toast.error("Please fill all required fields"); return; }
    setSubmitting(true);
    await base44.entities.VendorReview.create({
      ...reviewForm,
      vendor_id: vendorId,
      vendor_name: vendor?.business_name || "",
    });
    toast.success("Review submitted! It will appear after admin approval.");
    setReviewForm({ reviewer_name: "", reviewer_email: "", rating: 5, title: "", comment: "" });
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
                </div>
                <h1 className="font-heading text-3xl font-semibold">{vendor.business_name}</h1>
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
                    <div key={p.id} className="border border-border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                      {p.image_urls?.[0] && (
                        <img src={p.image_urls[0]} alt={p.name} className="w-full h-36 object-cover" />
                      )}
                      <div className="p-3">
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {p.discount_percent > 0 ? (
                            <>
                              <span className="text-sm font-bold text-primary">₦{(p.discounted_price || p.price * (1 - p.discount_percent / 100)).toLocaleString()}</span>
                              <span className="text-xs line-through text-muted-foreground">₦{p.price?.toLocaleString()}</span>
                              <Badge className="text-[9px] bg-red-100 text-red-700 border-red-300">-{p.discount_percent}%</Badge>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-primary">₦{p.price?.toLocaleString()}</span>
                          )}
                          {p.unit && <span className="text-xs text-muted-foreground">/ {p.unit}</span>}
                        </div>
                      </div>
                    </div>
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
                      {r.title && <p className="text-sm font-medium mb-1">{r.title}</p>}
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
                  <Input placeholder="Review title" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} />
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
                  <a href={`tel:${vendor.phone}`} className="flex gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span>{vendor.phone}</span>
                  </a>
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
                {vendor.phone && (
                  <Button asChild className="w-full" size="sm">
                    <a href={`tel:${vendor.phone}`}><Phone className="w-4 h-4 mr-2" />Call Now</a>
                  </Button>
                )}
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