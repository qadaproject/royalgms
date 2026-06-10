import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Edit2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClaimListingDialog({ listing, onClose }) {
  const [form, setForm] = useState({ submitter_name: "", submitter_email: "", submitter_phone: "", claim_details: "", update_details: "" });
  const [type, setType] = useState("claim_request"); // claim_request | update_info
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.DirectorySubmission.create({
      type: "claim_request",
      listing_id: listing.id || listing.google_place_id,
      listing_name: listing.name,
      submitter_name: form.submitter_name,
      submitter_email: form.submitter_email,
      submitter_phone: form.submitter_phone,
      claim_details: type === "claim_request" ? form.claim_details : undefined,
      update_details: form.update_details,
      status: "pending",
    });
    setDone(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#110804] border border-[#c9a84c]/20 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#c9a84c]/10">
          <div className="flex items-center gap-3">
            <Edit2 className="w-5 h-5 text-[#c9a84c]" />
            <h2 className="font-heading text-lg text-[#f5ede0]">Claim / Update Listing</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-[#f5ede0]/40 hover:text-[#f5ede0]" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-[#f5ede0] font-semibold mb-2">Request Submitted!</h3>
            <p className="text-[#f5ede0]/50 text-sm font-sans">Admin will review your {type === "claim_request" ? "claim" : "update request"} and contact you at {form.submitter_email}.</p>
            <Button onClick={onClose} className="mt-6 bg-[#c9a84c] text-[#0d0603] hover:bg-[#b8963e]">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-[#f5ede0]/50 text-xs font-sans">For: <strong className="text-[#c9a84c]">{listing.name}</strong></p>

            <div className="flex gap-2">
              {[["claim_request", "Claim This Business"], ["update_info", "Request Info Update"]].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setType(val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-sans border transition-colors ${type === val ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]" : "border-[#c9a84c]/20 text-[#f5ede0]/40 hover:text-[#f5ede0]"}`}>
                  {label}
                </button>
              ))}
            </div>

            <Input value={form.submitter_name} onChange={e => set("submitter_name", e.target.value)} placeholder="Your full name *" required className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
            <Input value={form.submitter_email} onChange={e => set("submitter_email", e.target.value)} placeholder="Your email *" type="email" required className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
            <Input value={form.submitter_phone} onChange={e => set("submitter_phone", e.target.value)} placeholder="Your phone number" className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />

            {type === "claim_request" && (
              <textarea value={form.claim_details} onChange={e => set("claim_details", e.target.value)} placeholder="How do you verify ownership? (e.g. I am the owner, registration number, etc.)" rows={3} required
                className="w-full bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 text-sm rounded-md px-3 py-2 font-sans focus:outline-none resize-none" />
            )}

            <textarea value={form.update_details} onChange={e => set("update_details", e.target.value)} placeholder={type === "claim_request" ? "What information needs to be updated? (optional)" : "What information needs to be updated? *"} rows={3} required={type === "update_info"}
              className="w-full bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 text-sm rounded-md px-3 py-2 font-sans focus:outline-none resize-none" />

            <Button type="submit" disabled={loading} className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0603] font-bold">
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}