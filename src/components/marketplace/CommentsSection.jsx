import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, Reply, User, Loader2 } from "lucide-react";
import { getMpUser } from "@/lib/marketplaceAuth";
import { toast } from "sonner";

function CommentItem({ comment, replies, vendorId, mpUser, onReact, onReplySubmit }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    await onReplySubmit(comment.id, replyText.trim());
    setReplyText("");
    setShowReply(false);
    setSubmittingReply(false);
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {comment.author_avatar_url
            ? <img src={comment.author_avatar_url} alt="" className="w-full h-full object-cover" />
            : <User className="w-4 h-4 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-sm">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">{new Date(comment.created_date).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-foreground">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => mpUser ? onReact(comment, "thumbs_up") : toast.info("Sign in to react")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> {comment.thumbs_up || 0}
            </button>
            <button
              onClick={() => mpUser ? onReact(comment, "thumbs_down") : toast.info("Sign in to react")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <ThumbsDown className="w-3.5 h-3.5" /> {comment.thumbs_down || 0}
            </button>
            {mpUser && (
              <button
                onClick={() => setShowReply(r => !r)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="w-3.5 h-3.5" /> Reply
              </button>
            )}
            {!mpUser && (
              <Link to="/marketplace/login" className="text-xs text-primary hover:underline">
                Sign in to reply
              </Link>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="h-16 text-sm flex-1"
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={submitReply} disabled={submittingReply || !replyText.trim()}>
                  {submittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : "Post"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Replies */}
      {replies.length > 0 && (
        <div className="mt-3 ml-8 space-y-2 border-l-2 border-primary/20 pl-4">
          {replies.map(reply => (
            <div key={reply.id} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <span className="text-[10px]">🏪</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-primary">{reply.author_name}</span>
                  <span className="text-[10px] bg-primary/10 text-primary rounded px-1">Vendor</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(reply.created_date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground">{reply.content}</p>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => mpUser ? onReact(reply, "thumbs_up") : toast.info("Sign in to react")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" /> {reply.thumbs_up || 0}
                  </button>
                  <button
                    onClick={() => mpUser ? onReact(reply, "thumbs_down") : toast.info("Sign in to react")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <ThumbsDown className="w-3 h-3" /> {reply.thumbs_down || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ vendorId, productId = null }) {
  const queryClient = useQueryClient();
  const mpUser = getMpUser();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const commentKey = productId ? ["comments", vendorId, productId] : ["comments", vendorId];
  const filter = productId
    ? { vendor_id: vendorId, product_id: productId }
    : { vendor_id: vendorId };

  const { data: allComments = [] } = useQuery({
    queryKey: commentKey,
    queryFn: () => base44.entities.VendorComment.filter({ ...filter, is_visible: true }, "-created_date", 100),
  });

  const topLevel = allComments.filter(c => !c.parent_id);
  const getReplies = (parentId) => allComments.filter(c => c.parent_id === parentId);

  const { data: myReactions = [] } = useQuery({
    queryKey: ["my_reactions", mpUser?.id, vendorId, productId],
    queryFn: () => base44.entities.CommentReaction.filter({ user_id: mpUser.id }),
    enabled: !!mpUser?.id,
  });

  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (!mpUser) { toast.info("Please sign in to comment"); return; }
    setSubmitting(true);
    await base44.entities.VendorComment.create({
      vendor_id: vendorId,
      product_id: productId || undefined,
      author_type: "user",
      author_id: mpUser.id,
      author_name: mpUser.display_name,
      author_avatar_url: mpUser.avatar_url || "",
      content: newComment.trim(),
      thumbs_up: 0,
      thumbs_down: 0,
      is_visible: true,
    });
    // Notify vendor
    base44.functions.invoke("notifyVendorComment", {
      vendor_id: vendorId,
      commenter_name: mpUser.display_name,
      comment_content: newComment.trim(),
      product_name: productId ? "a product" : null,
    }).catch(() => {});
    setNewComment("");
    queryClient.invalidateQueries(commentKey);
    toast.success("Comment posted!");
    setSubmitting(false);
  };

  const submitVendorReply = async (parentId, content) => {
    // This is called from vendor dashboard — handled differently
    // Here it's user-to-comment reply (still stored as user reply)
    await base44.entities.VendorComment.create({
      vendor_id: vendorId,
      product_id: productId || undefined,
      parent_id: parentId,
      author_type: "user",
      author_id: mpUser.id,
      author_name: mpUser.display_name,
      author_avatar_url: mpUser.avatar_url || "",
      content,
      thumbs_up: 0,
      thumbs_down: 0,
      is_visible: true,
    });
    queryClient.invalidateQueries(commentKey);
    toast.success("Reply posted!");
  };

  const handleReact = async (comment, reaction) => {
    const existing = myReactions.find(r => r.comment_id === comment.id);
    if (existing) {
      if (existing.reaction === reaction) {
        // Remove reaction
        await base44.entities.CommentReaction.delete(existing.id);
        const delta = reaction === "thumbs_up" ? { thumbs_up: Math.max(0, (comment.thumbs_up || 0) - 1) } : { thumbs_down: Math.max(0, (comment.thumbs_down || 0) - 1) };
        await base44.entities.VendorComment.update(comment.id, delta);
      } else {
        // Switch reaction
        await base44.entities.CommentReaction.update(existing.id, { reaction });
        const delta = reaction === "thumbs_up"
          ? { thumbs_up: (comment.thumbs_up || 0) + 1, thumbs_down: Math.max(0, (comment.thumbs_down || 0) - 1) }
          : { thumbs_down: (comment.thumbs_down || 0) + 1, thumbs_up: Math.max(0, (comment.thumbs_up || 0) - 1) };
        await base44.entities.VendorComment.update(comment.id, delta);
      }
    } else {
      await base44.entities.CommentReaction.create({ comment_id: comment.id, user_id: mpUser.id, reaction });
      const delta = reaction === "thumbs_up" ? { thumbs_up: (comment.thumbs_up || 0) + 1 } : { thumbs_down: (comment.thumbs_down || 0) + 1 };
      await base44.entities.VendorComment.update(comment.id, delta);
    }
    queryClient.invalidateQueries(commentKey);
    queryClient.invalidateQueries(["my_reactions", mpUser?.id, vendorId, productId]);
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        Comments ({topLevel.length})
      </h2>

      {/* New comment box */}
      {mpUser ? (
        <div className="flex gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 mt-1">
            {mpUser.avatar_url ? <img src={mpUser.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-primary" />}
          </div>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Leave a comment..."
              className="h-20 text-sm mb-2"
            />
            <Button size="sm" onClick={submitComment} disabled={submitting || !newComment.trim()}>
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/40 border border-border rounded-xl p-4 mb-5 text-center">
          <p className="text-sm text-muted-foreground mb-2">Sign in to leave a comment, react, or reply.</p>
          <Link to="/marketplace/login">
            <Button size="sm" variant="outline">Sign In</Button>
          </Link>
        </div>
      )}

      {/* Comments list */}
      {topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {topLevel.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={getReplies(c.id)}
              vendorId={vendorId}
              mpUser={mpUser}
              onReact={handleReact}
              onReplySubmit={submitVendorReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}