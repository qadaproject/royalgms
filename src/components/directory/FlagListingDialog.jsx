import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Flag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FLAG_REASONS = [
  "Incorrect information",
  "Business permanently closed",
  "Duplicate listing",
  "Offensive content",
  "Spam or fake listing",
  "Wrong location",
  "Other",
];

export default function FlagListingDialog({ listing, onClose }) {
  const [form, setForm] = useState({ submitter_name: "", submitter_email: "", flag_reason: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.DirectorySubmission.create({
      type: "flag_report",
      listing_id: listing.id || listing.google_place_id,
      listing_name: listing.name,
      submitter_name: form.submitter_name,
      submitter_email: form.submitter_email,
      flag_reason: form.flag_reason + (form.notes ? ` — ${form.notes}` : ""),
      status: "pending",
    });
    setDone(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#110804] border border-[#c9a84c]/20 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[#c9a84c]/10">
          <div className="flex items-center gap-3">
            <Flag className="w-5 h-5 text-red-400" />
            <h2 className="font-heading text-lg text-[#f5ede0]">Report Listing</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-[#f5ede0]/40 hover:text-[#f5ede0]" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-[#f5ede0] font-semibold mb-2">Report Received</h3>
            <p className="text-[#f5ede0]/50 text-sm font-sans">Our admin team will review this report for <strong>{listing.name}</strong>.</p>
            <Button onClick={onClose} className="mt-6 bg-[#c9a84c] text-[#0d0603] hover:bg-[#b8963e]">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-[#f5ede0]/50 text-xs font-sans">Reporting: <strong className="text-[#c9a84c]">{listing.name}</strong></p>
            <Input value={form.submitter_name} onChange={e => set("submitter_name", e.target.value)} placeholder="Your name *" required className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
            <Input value={form.submitter_email} onChange={e => set("submitter_email", e.target.value)} placeholder="Your email *" type="email" required className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
            <div className="space-y-2">
              <p className="text-[#f5ede0]/50 text-xs font-sans">Reason for report:</p>
              <div className="grid grid-cols-1 gap-2">
                {FLAG_REASONS.map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="reason" value={r} checked={form.flag_reason === r} onChange={e => set("flag_reason", e.target.value)}
                      className="accent-[#c9a84c]" required />
                    <span className="text-[#f5ede0]/70 text-sm font-sans">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Additional details (optional)" rows={2}
              className="w-full bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 text-sm rounded-md px-3 py-2 font-sans focus:outline-none resize-none" />
            <Button type="submit" disabled={loading} className="w-full bg-red-500/80 hover:bg-red-500 text-white font-bold">
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}