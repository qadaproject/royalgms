import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Mail, Send, Users, User, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminVendorMessaging({ vendors, categories }) {
  const [mode, setMode] = useState("individual"); // 'individual' | 'bulk'
  const [targetVendorId, setTargetVendorId] = useState("");
  const [targetCategory, setTargetCategory] = useState("all");
  const [targetStatus, setTargetStatus] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sentLog, setSentLog] = useState([]);

  const approvedVendors = vendors.filter(v => v.approval_status === "Approved");

  const recipientVendors = mode === "individual"
    ? vendors.filter(v => v.id === targetVendorId)
    : vendors.filter(v => {
        const statusMatch = targetStatus === "all" || v.approval_status === targetStatus;
        const catMatch = targetCategory === "all" || v.category_name === targetCategory;
        return statusMatch && catMatch;
      });

  const sendMessages = async () => {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and message are required"); return; }
    if (recipientVendors.length === 0) { toast.error("No recipients match the selected filters"); return; }

    setSending(true);
    let successCount = 0;
    const newLog = [];

    for (const v of recipientVendors) {
      try {
        await base44.functions.invoke("sendEmail", {
          to: v.email,
          subject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#7f1d1d;">Royal Marketplace</h2>
            <p>Dear <strong>${v.business_name}</strong>,</p>
            ${body.split("\n").map(line => `<p>${line}</p>`).join("")}
            <hr/>
            <p style="font-size:12px;color:#666;">Royal Marketplace Admin Team · Warri Kingdom</p>
          </div>`,
          from_name: "Royal Marketplace",
        });
        successCount++;
        newLog.push({ name: v.business_name, email: v.email, ok: true });
      } catch {
        newLog.push({ name: v.business_name, email: v.email, ok: false });
      }
    }

    setSentLog(newLog);
    setSending(false);
    toast.success(`Message sent to ${successCount} of ${recipientVendors.length} vendor(s)`);
  };

  const uniqueCategories = [...new Set(vendors.map(v => v.category_name).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-3">
        <Button size="sm" variant={mode === "individual" ? "default" : "outline"} onClick={() => setMode("individual")}>
          <User className="w-4 h-4 mr-1" /> Individual
        </Button>
        <Button size="sm" variant={mode === "bulk" ? "default" : "outline"} onClick={() => setMode("bulk")}>
          <Users className="w-4 h-4 mr-1" /> Bulk / Group
        </Button>
      </div>

      {/* Recipient Selector */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-heading text-base font-semibold flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />Recipients
        </h3>

        {mode === "individual" ? (
          <div className="space-y-1.5">
            <Label>Select Vendor</Label>
            <Select value={targetVendorId} onValueChange={setTargetVendorId}>
              <SelectTrigger><SelectValue placeholder="Choose a vendor..." /></SelectTrigger>
              <SelectContent>
                {vendors.filter(v => v.email).map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.business_name} ({v.approval_status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Filter by Status</Label>
              <Select value={targetStatus} onValueChange={setTargetStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Filter by Category</Label>
              <Select value={targetCategory} onValueChange={setTargetCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {recipientVendors.length > 0 && (
          <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <span><strong>{recipientVendors.length}</strong> recipient(s): {recipientVendors.slice(0, 3).map(v => v.business_name).join(", ")}{recipientVendors.length > 3 ? ` +${recipientVendors.length - 3} more` : ""}</span>
          </div>
        )}
      </div>

      {/* Message Compose */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-heading text-base font-semibold">Compose Message</h3>
        <div className="space-y-1.5">
          <Label>Subject *</Label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Important update from Royal Marketplace" />
        </div>
        <div className="space-y-1.5">
          <Label>Message Body *</Label>
          <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Type your message here..." className="min-h-[160px]" />
          <p className="text-xs text-muted-foreground">The vendor's business name will be used as the greeting automatically.</p>
        </div>
        <Button onClick={sendMessages} disabled={sending || recipientVendors.length === 0} className="gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? `Sending to ${recipientVendors.length}...` : `Send to ${recipientVendors.length} Vendor(s)`}
        </Button>
      </div>

      {/* Sent Log */}
      {sentLog.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading text-base font-semibold mb-3">Delivery Log</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sentLog.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {entry.ok
                  ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  : <span className="w-4 h-4 text-red-500 shrink-0 text-center">✗</span>}
                <span className="font-medium">{entry.name}</span>
                <span className="text-muted-foreground text-xs">{entry.email}</span>
                <Badge variant="outline" className={`text-[9px] ml-auto ${entry.ok ? "text-emerald-600 border-emerald-300" : "text-red-600 border-red-300"}`}>
                  {entry.ok ? "Sent" : "Failed"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}