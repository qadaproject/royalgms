import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Heart, Share2, MessageSquare, Flag, Pencil, Trash2, CheckCircle, Clock, ChevronDown, ChevronUp, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ProductEngagementCard({ product, vendor, onEdit, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [replyContent, setReplyContent] = useState({});
  const [submittingReply, setSubmittingReply] = useState(null);
  const queryClient = useQueryClient();

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["product_interactions", product.id],
    queryFn: () => base44.entities.VendorProductInteraction.filter({ product_id: product.id }),
    enabled: showComments,
  });

  const userComments = comments.filter(c => c.type === "comment");
  const reports = comments.filter(c => c.type === "report");
  const replies = comments.filter(c => c.type === "vendor_reply");

  const submitReply = async (commentId) => {
    const text = replyContent[commentId]?.trim();
    if (!text) return;
    setSubmittingReply(commentId);
    await base44.entities.VendorProductInteraction.create({
      product_id: product.id,
      vendor_id: product.vendor_id,
      type: "vendor_reply",
      author_name: vendor.business_name,
      content: text,
      parent_id: commentId,
      is_approved: true,
    });
    setReplyContent(r => ({ ...r, [commentId]: "" }));
    setSubmittingReply(null);
    refetchComments();
    toast.success("Reply posted");
  };

  const engagementStats = [
    { icon: <Eye className="w-3.5 h-3.5 text-muted-foreground" />, value: product.view_count || 0, label: "Views" },
    { icon: <Heart className="w-3.5 h-3.5 text-red-400" />, value: product.favourite_count || 0, label: "Favs" },
    { icon: <Share2 className="w-3.5 h-3.5 text-green-500" />, value: product.share_count || 0, label: "Shares" },
    { icon: <MessageSquare className="w-3.5 h-3.5 text-blue-500" />, value: product.comment_count || 0, label: "Comments" },
    { icon: <Flag className="w-3.5 h-3.5 text-amber-500" />, value: product.report_count || 0, label: "Reports" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Top row */}
      <div className="flex gap-3">
        {product.image_urls?.[0] && (
          <img src={product.image_urls[0]} alt={product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
          <p className="text-sm font-bold text-primary mt-1">₦{product.price?.toLocaleString()}{product.unit ? ` / ${product.unit}` : ""}</p>
          <div className="mt-1.5">
            {vendor.approval_status === "Approved"
              ? <Badge variant="outline" className="gap-1 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300"><CheckCircle className="w-2.5 h-2.5" />Approved</Badge>
              : <Badge variant="outline" className="gap-1 text-[10px] bg-amber-50 text-amber-700 border-amber-300"><Clock className="w-2.5 h-2.5" />Pending</Badge>
            }
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Engagement stats */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border flex-wrap">
        {engagementStats.map(s => (
          <div key={s.label} className="flex items-center gap-1 text-xs text-muted-foreground">
            {s.icon}
            <span className="font-semibold text-foreground">{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
        <button
          onClick={() => { setShowComments(s => !s); }}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-600 transition-colors"
        >
          {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showComments ? "Hide" : "View comments & reports"}
        </button>
      </div>

      {/* Comments & replies section */}
      {showComments && (
        <div className="mt-3 space-y-2">
          {userComments.length === 0 && reports.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No comments or reports yet.</p>
          )}

          {/* Comments */}
          {userComments.map(c => {
            const myReply = replies.find(r => r.parent_id === c.id);
            return (
              <div key={c.id} className="bg-muted rounded-lg p-2.5 text-xs">
                <p className="font-semibold">{c.author_name}</p>
                <p className="text-muted-foreground mt-0.5">{c.content}</p>
                {myReply ? (
                  <div className="mt-2 ml-3 bg-primary/5 border border-primary/20 rounded-lg p-2">
                    <p className="font-semibold text-primary">🏪 Your reply</p>
                    <p className="text-muted-foreground">{myReply.content}</p>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-1.5">
                    <Textarea
                      placeholder="Reply to this comment..."
                      className="h-10 text-xs"
                      value={replyContent[c.id] || ""}
                      onChange={e => setReplyContent(r => ({ ...r, [c.id]: e.target.value }))}
                    />
                    <Button
                      size="icon" className="h-10 w-8 shrink-0"
                      disabled={submittingReply === c.id}
                      onClick={() => submitReply(c.id)}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Reports */}
          {reports.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {reports.length} Report{reports.length > 1 ? "s" : ""}
              </p>
              {reports.map(r => (
                <div key={r.id} className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs mb-1">
                  <p className="font-semibold text-amber-800">{r.author_name} — <span className="font-normal">{r.report_reason}</span></p>
                  {r.content && <p className="text-amber-700 mt-0.5">{r.content}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}