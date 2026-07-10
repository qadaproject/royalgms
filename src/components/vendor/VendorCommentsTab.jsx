import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Package, ChevronDown, ChevronUp } from "lucide-react";

export default function VendorCommentsTab({ comments, products, onReply }) {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [collapsedProducts, setCollapsedProducts] = useState({});
  const [filter, setFilter] = useState("all"); // all | unreplied

  const unreplied = comments.filter(c => !c.vendor_reply && !c.parent_id);
  const topLevel = comments.filter(c => !c.parent_id);

  // Group top-level comments by product (null = general vendor comment)
  const groups = {};
  topLevel.forEach(c => {
    const key = c.product_id || "__general__";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  const filtered = filter === "unreplied"
    ? { ...(unreplied.length ? { unreplied } : {}) }
    : groups;

  const displayGroups = filter === "unreplied"
    ? (unreplied.length ? [{ key: "unreplied", label: "Awaiting Reply", comments: unreplied }] : [])
    : Object.entries(groups).map(([key, cmts]) => {
        const product = products.find(p => p.id === key);
        return {
          key,
          label: key === "__general__" ? "General (Business)" : product?.name || "Unknown Product",
          isProduct: key !== "__general__",
          comments: cmts,
        };
      }).sort((a, b) => {
        // Unreplied first
        const aNew = a.comments.filter(c => !c.vendor_reply).length;
        const bNew = b.comments.filter(c => !c.vendor_reply).length;
        return bNew - aNew;
      });

  const submitReply = async (commentId) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    await onReply(commentId, text);
    setReplyText(r => ({ ...r, [commentId]: "" }));
    setReplyingTo(null);
  };

  const toggleCollapse = (key) => setCollapsedProducts(s => ({ ...s, [key]: !s[key] }));

  if (comments.length === 0) return (
    <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm">No comments yet. They'll appear here when customers leave feedback.</p>
    </div>
  );

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          All <span className="ml-1 opacity-70">{topLevel.length}</span>
        </button>
        <button
          onClick={() => setFilter("unreplied")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${filter === "unreplied" ? "bg-amber-500 text-white border-amber-500" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
        >
          <MessageSquare className="w-3 h-3" /> Needs Reply
          {unreplied.length > 0 && <span className="bg-white text-amber-700 rounded-full text-[9px] w-4 h-4 flex items-center justify-center ml-0.5 font-bold">{unreplied.length}</span>}
        </button>
      </div>

      {displayGroups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No comments awaiting reply — you're all caught up! 🎉</div>
      ) : (
        <div className="space-y-4">
          {displayGroups.map(group => {
            const unrepliedCount = group.comments.filter(c => !c.vendor_reply).length;
            const isCollapsed = collapsedProducts[group.key];

            return (
              <div key={group.key} className="border border-border rounded-xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleCollapse(group.key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{group.label}</span>
                    <Badge variant="outline" className="text-[9px]">{group.comments.length} comment{group.comments.length !== 1 ? "s" : ""}</Badge>
                    {unrepliedCount > 0 && (
                      <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-300 border">{unrepliedCount} need{unrepliedCount === 1 ? "s" : ""} reply</Badge>
                    )}
                  </div>
                  {isCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                </button>

                {/* Comments */}
                {!isCollapsed && (
                  <div className="divide-y divide-border">
                    {group.comments.map(c => (
                      <div key={c.id} className={`p-4 ${!c.vendor_reply ? "bg-amber-50/40" : ""}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">{c.author_name?.[0] || "?"}</span>
                            </div>
                            <span className="font-semibold text-sm">{c.author_name}</span>
                            {!c.vendor_reply && (
                              <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300 bg-amber-50">Awaiting reply</Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">{new Date(c.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>

                        <p className="text-sm text-foreground mb-2 ml-9">{c.content}</p>

                        {c.thumbs_up > 0 || c.thumbs_down > 0 ? (
                          <p className="text-[10px] text-muted-foreground ml-9 mb-2">👍 {c.thumbs_up || 0} &nbsp; 👎 {c.thumbs_down || 0}</p>
                        ) : null}

                        {/* Existing reply */}
                        {c.vendor_reply && replyingTo !== c.id && (
                          <div className="ml-9 mt-2 pl-3 border-l-2 border-primary/20 bg-primary/5 rounded-r-lg py-2 pr-2">
                            <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">Your reply:</p>
                            <p className="text-sm text-foreground">{c.vendor_reply}</p>
                            <button onClick={() => { setReplyingTo(c.id); setReplyText(r => ({ ...r, [c.id]: c.vendor_reply })); }}
                              className="text-[10px] text-primary underline mt-1">Edit reply</button>
                          </div>
                        )}

                        {/* Reply box */}
                        {replyingTo === c.id ? (
                          <div className="ml-9 mt-2 flex gap-2">
                            <Textarea
                              value={replyText[c.id] || ""}
                              onChange={e => setReplyText(r => ({ ...r, [c.id]: e.target.value }))}
                              placeholder="Write your reply..."
                              className="h-16 text-sm flex-1"
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <Button size="sm" onClick={() => submitReply(c.id)} disabled={!replyText[c.id]?.trim()}>
                                <Send className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>✕</Button>
                            </div>
                          </div>
                        ) : !c.vendor_reply ? (
                          <button
                            onClick={() => setReplyingTo(c.id)}
                            className="ml-9 mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> Reply
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}