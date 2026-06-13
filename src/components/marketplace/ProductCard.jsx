import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Share2, MessageSquare, Flag, ChevronDown, ChevronUp, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

function getFingerprint() {
  return btoa(`${navigator.userAgent}|${screen.width}x${screen.height}`).slice(0, 32);
}

function buildWhatsAppMessage(vendor, product) {
  const vendorUrl = vendor.marketplace_username
    ? `${window.location.origin}/marketplace/vendor/${vendor.marketplace_username}`
    : `${window.location.origin}/marketplace/vendor?id=${vendor.id}`;
  const price = product.discount_percent > 0
    ? `₦${(product.discounted_price || product.price * (1 - product.discount_percent / 100)).toLocaleString()} (${product.discount_percent}% off)`
    : `₦${product.price?.toLocaleString()}`;
  const unit = product.unit ? ` / ${product.unit}` : "";
  const lines = [
    `🛍️ *${product.name}*`,
    `💰 ${price}${unit}`,
    product.description ? `📝 ${product.description}` : null,
    `🏪 *${vendor.business_name}*`,
    vendor.location_city ? `📍 ${vendor.location_city}${vendor.location_state ? `, ${vendor.location_state}` : ""}` : null,
    vendor.phone ? `📞 ${vendor.phone}` : null,
    `🔗 ${vendorUrl}`,
    vendor.logo_url ? `\n🖼️ Logo: ${vendor.logo_url}` : null,
    product.image_urls?.[0] ? `\n📸 Image: ${product.image_urls[0]}` : null,
  ];
  return encodeURIComponent(lines.filter(Boolean).join("\n"));
}

export default function ProductCard({ product, vendor }) {
  const fp = getFingerprint();
  const [isFav, setIsFav] = useState(false);
  const [counts, setCounts] = useState({
    favourite: product.favourite_count || 0,
    share: product.share_count || 0,
    comment: product.comment_count || 0,
  });
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ author_name: "", content: "" });
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportForm, setReportForm] = useState({ author_name: "", report_reason: "Inaccurate info", content: "" });
  const [submitting, setSubmitting] = useState(false);

  // Track view on mount (deduplicated by fingerprint)
  useEffect(() => {
    const viewKey = `viewed_${product.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "1");
      base44.entities.VendorProductInteraction.create({
        product_id: product.id, vendor_id: product.vendor_id, type: "view", user_fingerprint: fp,
      }).then(() => {
        base44.entities.VendorProduct.update(product.id, { view_count: (product.view_count || 0) + 1 });
      }).catch(() => {});
    }
    // Check if already favourited
    const favKey = `fav_${product.id}`;
    setIsFav(!!localStorage.getItem(favKey));
  }, [product.id]);

  const loadComments = async () => {
    const data = await base44.entities.VendorProductInteraction.filter({
      product_id: product.id, is_approved: true,
    });
    setComments(data.filter(d => d.type === "comment" || d.type === "vendor_reply"));
  };

  const toggleComments = async () => {
    if (!showComments) await loadComments();
    setShowComments(s => !s);
  };

  const handleFavourite = async () => {
    const favKey = `fav_${product.id}`;
    if (isFav) {
      localStorage.removeItem(favKey);
      setIsFav(false);
      setCounts(c => ({ ...c, favourite: Math.max(0, c.favourite - 1) }));
      await base44.entities.VendorProduct.update(product.id, { favourite_count: Math.max(0, (product.favourite_count || 0) - 1) });
    } else {
      localStorage.setItem(favKey, "1");
      setIsFav(true);
      setCounts(c => ({ ...c, favourite: c.favourite + 1 }));
      await base44.entities.VendorProductInteraction.create({
        product_id: product.id, vendor_id: product.vendor_id, type: "favourite", user_fingerprint: fp,
      });
      await base44.entities.VendorProduct.update(product.id, { favourite_count: (product.favourite_count || 0) + 1 });
    }
  };

  const handleShare = async () => {
    const msg = buildWhatsAppMessage(vendor, product);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setCounts(c => ({ ...c, share: c.share + 1 }));
    await base44.entities.VendorProductInteraction.create({
      product_id: product.id, vendor_id: product.vendor_id, type: "share", user_fingerprint: fp,
    });
    await base44.entities.VendorProduct.update(product.id, { share_count: (product.share_count || 0) + 1 });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentForm.author_name || !commentForm.content) { toast.error("Name and comment are required"); return; }
    setSubmitting(true);
    await base44.entities.VendorProductInteraction.create({
      product_id: product.id, vendor_id: product.vendor_id, type: "comment",
      author_name: commentForm.author_name, content: commentForm.content, is_approved: true,
    });
    await base44.entities.VendorProduct.update(product.id, { comment_count: (product.comment_count || 0) + 1 });
    setCounts(c => ({ ...c, comment: c.comment + 1 }));
    setCommentForm({ author_name: "", content: "" });
    await loadComments();
    setSubmitting(false);
    toast.success("Comment posted!");
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.author_name) { toast.error("Please enter your name"); return; }
    setSubmitting(true);
    await base44.entities.VendorProductInteraction.create({
      product_id: product.id, vendor_id: product.vendor_id, type: "report",
      author_name: reportForm.author_name, report_reason: reportForm.report_reason,
      content: reportForm.content, is_approved: false,
    });
    await base44.entities.VendorProduct.update(product.id, { report_count: (product.report_count || 0) + 1 });
    setShowReportDialog(false);
    setReportForm({ author_name: "", report_reason: "Inaccurate info", content: "" });
    setSubmitting(false);
    toast.success("Report submitted. Thank you.");
  };

  const displayPrice = product.discount_percent > 0
    ? product.discounted_price || product.price * (1 - product.discount_percent / 100)
    : product.price;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow">
      {product.image_urls?.[0] && (
        <img src={product.image_urls[0]} alt={product.name} className="w-full h-36 object-cover" />
      )}
      <div className="p-3">
        <p className="font-semibold text-sm">{product.name}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 mt-2">
          {product.discount_percent > 0 ? (
            <>
              <span className="text-sm font-bold text-primary">₦{displayPrice.toLocaleString()}</span>
              <span className="text-xs line-through text-muted-foreground">₦{product.price?.toLocaleString()}</span>
              <Badge className="text-[9px] bg-red-100 text-red-700 border-red-300">-{product.discount_percent}%</Badge>
            </>
          ) : (
            <span className="text-sm font-bold text-primary">₦{product.price?.toLocaleString()}</span>
          )}
          {product.unit && <span className="text-xs text-muted-foreground">/ {product.unit}</span>}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
          <button
            onClick={handleFavourite}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${isFav ? "text-red-500 bg-red-50" : "text-muted-foreground hover:text-red-500 hover:bg-red-50"}`}
            title="Favourite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
            <span>{counts.favourite > 0 ? counts.favourite : ""}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{counts.share > 0 ? counts.share : ""}</span>
          </button>
          <button
            onClick={toggleComments}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${showComments ? "text-blue-600 bg-blue-50" : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50"}`}
            title="Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{counts.comment > 0 ? counts.comment : ""}</span>
            {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setShowReportDialog(s => !s)}
            className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Report"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 space-y-2">
            {comments.length === 0 && <p className="text-xs text-muted-foreground italic">No comments yet.</p>}
            {comments.map(c => (
              <div key={c.id} className={`text-xs rounded-lg p-2 ${c.type === "vendor_reply" ? "bg-primary/5 border border-primary/20 ml-3" : "bg-muted"}`}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="font-semibold">{c.type === "vendor_reply" ? "🏪 " + (vendor.business_name || "Vendor") : c.author_name}</span>
                  {c.type === "vendor_reply" && <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20 py-0 px-1">Reply</Badge>}
                </div>
                <p className="text-muted-foreground">{c.content}</p>
              </div>
            ))}
            <form onSubmit={submitComment} className="mt-2 space-y-1.5">
              <Input
                placeholder="Your name"
                className="h-7 text-xs"
                value={commentForm.author_name}
                onChange={e => setCommentForm(f => ({ ...f, author_name: e.target.value }))}
              />
              <div className="flex gap-1">
                <Textarea
                  placeholder="Write a comment..."
                  className="h-14 text-xs"
                  value={commentForm.content}
                  onChange={e => setCommentForm(f => ({ ...f, content: e.target.value }))}
                />
                <Button type="submit" size="icon" className="h-14 w-8 shrink-0" disabled={submitting}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Report section */}
        {showReportDialog && (
          <form onSubmit={submitReport} className="mt-3 space-y-1.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-800 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />Report this listing
            </div>
            <Input placeholder="Your name *" className="h-7 text-xs" value={reportForm.author_name} onChange={e => setReportForm(f => ({ ...f, author_name: e.target.value }))} />
            <select
              className="w-full h-7 text-xs border border-input rounded-md px-2 bg-background"
              value={reportForm.report_reason}
              onChange={e => setReportForm(f => ({ ...f, report_reason: e.target.value }))}
            >
              {["Spam", "Inaccurate info", "Offensive content", "Fraud", "Other"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <Textarea placeholder="Details (optional)" className="h-12 text-xs" value={reportForm.content} onChange={e => setReportForm(f => ({ ...f, content: e.target.value }))} />
            <div className="flex gap-1.5">
              <Button type="button" variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => setShowReportDialog(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="flex-1 h-7 text-xs bg-amber-600 hover:bg-amber-700" disabled={submitting}>Submit</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}