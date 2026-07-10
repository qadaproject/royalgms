import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import useMpUser from "@/hooks/useMpUser";
import { toast } from "sonner";

const MARKETPLACE_EMAIL = "marketplace@royalgms.com";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ReactionButtons({ commentId, target, thumbsUp, thumbsDown, onReact }) {
  const { user } = useMpUser();
  const [loading, setLoading] = useState(null);

  const handleReact = async (reaction) => {
    if (!user) { toast.error("Please sign in to react"); return; }
    setLoading(reaction);
    await onReact(commentId, target, reaction);
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => handleReact("thumbs_up")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
        {loading === "thumbs_up" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
        <span>{thumbsUp || 0}</span>
      </button>
      <button onClick={() => handleReact("thumbs_down")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
        {loading === "thumbs_down" ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsDown className="w-3 h-3" />}
        <span>{thumbsDown || 0}</span>
      </button>
    </div>
  );
}

export default function CommentSection({ vendorId, vendorName, vendorEmail, productId = null, productName = null }) {
  const { user } = useMpUser();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({});

  const qKey = ["comments", vendorId, productId];
  const { data: comments = [], isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () => {
      const filter = { vendor_id: vendorId, is_approved: true };
      if (productId) filter.product_id = productId;
      else filter.product_id = null;
      return base44.entities.VendorComment.filter(filter, "-created_date", 100);
    },
    enabled: !!vendorId,
  });

  const submitComment = async () => {
    if (!user) { toast.error("Please sign in to comment"); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    const newComment = {
      vendor_id: vendorId,
      vendor_name: vendorName,
      user_id: user.id,
      user_name: user.full_name,
      user_photo: user.photo_url || "",
      comment: commentText.trim(),
      ...(productId ? { product_id: productId, product_name: productName } : {}),
    };
    await base44.entities.VendorComment.create(newComment);

    // Notify vendor
    if (vendorEmail) {
      base44.functions.invoke("sendEmail", {
        to: vendorEmail,
        from_name: "Royal Marketplace",
        from_email: MARKETPLACE_EMAIL,
        subject: `New comment on your ${productId ? `product "${productName}"` : "listing"} — Royal Marketplace`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#7a1a1a;padding:20px;text-align:center;"><h1 style="color:#f5d78e;margin:0;font-size:20px;">Royal Marketplace</h1></div>
            <div style="padding:24px;background:#fff;">
              <h2 style="color:#1a1a1a;font-size:16px;">New Comment from ${user.full_name}</h2>
              ${productId ? `<p style="color:#555;font-size:13px;">Product: <strong>${productName}</strong></p>` : ""}
              <blockquote style="background:#f5f5f5;border-left:4px solid #7a1a1a;padding:12px 16px;margin:16px 0;border-radius:4px;">${commentText.trim()}</blockquote>
              <a href="${window.location.origin}/marketplace/vendor-dashboard" style="background:#7a1a1a;color:#f5d78e;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;">Reply in Dashboard</a>
            </div>
          </div>`,
      }).catch(() => {});
    }

    setCommentText("");
    queryClient.invalidateQueries({ queryKey: qKey });
    setSubmitting(false);
    toast.success("Comment posted!");
  };

  const handleReact = async (commentId, target, reaction) => {
    if (!user) return;
    // Check if already reacted
    const existing = await base44.entities.CommentReaction.filter({ comment_id: commentId, user_id: user.id, target });
    if (existing.length) {
      if (existing[0].reaction === reaction) {
        // Toggle off — just return (no double-reaction UX)
        return;
      }
      await base44.entities.CommentReaction.update(existing[0].id, { reaction });
    } else {
      await base44.entities.CommentReaction.create({ comment_id: commentId, user_id: user.id, target, reaction });
    }
    // Update counts on the comment
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    if (target === "comment") {
      const up = await base44.entities.CommentReaction.filter({ comment_id: commentId, target: "comment", reaction: "thumbs_up" });
      const down = await base44.entities.CommentReaction.filter({ comment_id: commentId, target: "comment", reaction: "thumbs_down" });
      await base44.entities.VendorComment.update(commentId, { thumbs_up: up.length, thumbs_down: down.length });
    } else {
      const up = await base44.entities.CommentReaction.filter({ comment_id: commentId, target: "reply", reaction: "thumbs_up" });
      const down = await base44.entities.CommentReaction.filter({ comment_id: commentId, target: "reply", reaction: "thumbs_down" });
      await base44.entities.VendorComment.update(commentId, { vendor_reply_thumbs_up: up.length, vendor_reply_thumbs_down: down.length });
    }
    queryClient.invalidateQueries({ queryKey: qKey });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-base font-semibold flex items-center gap-2">
        <MessageSquare className="w-4 h-4" /> Comments ({comments.length})
      </h3>

      {/* Post comment */}
      {user ? (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
            {user.photo_url ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" /> : user.full_name?.[0]}
          </div>
          <div className="flex-1 space-y-2">
            <Textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="h-20 text-sm"
            />
            <Button size="sm" onClick={submitComment} disabled={submitting || !commentText.trim()}>
              {submitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm text-muted-foreground text-center">
          <Link to="/marketplace/login" className="text-primary font-medium underline">Sign in</Link> to leave a comment
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-4">
              {/* User */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
                  {c.user_photo ? <img src={c.user_photo} alt="" className="w-full h-full object-cover" /> : c.user_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{c.user_name}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(c.created_date)}</span>
                  </div>
                  <p className="text-sm mt-1 leading-relaxed">{c.comment}</p>
                  <div className="mt-2">
                    <ReactionButtons commentId={c.id} target="comment" thumbsUp={c.thumbs_up} thumbsDown={c.thumbs_down} onReact={handleReact} />
                  </div>
                </div>
              </div>

              {/* Vendor reply */}
              {c.vendor_reply && (
                <div className="mt-3 ml-11 bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Vendor Reply</Badge>
                    {c.vendor_replied_at && <span className="text-xs text-muted-foreground">{timeAgo(c.vendor_replied_at)}</span>}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{c.vendor_reply}</p>
                  <div className="mt-2">
                    <ReactionButtons commentId={c.id} target="reply" thumbsUp={c.vendor_reply_thumbs_up} thumbsDown={c.vendor_reply_thumbs_down} onReact={handleReact} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}