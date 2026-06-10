import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddBusinessDialog({ onClose, categories }) {
  const [form, setForm] = useState({ submitter_name: "", submitter_email: "", submitter_phone: "", business_name: "", business_category: "", business_address: "", business_phone: "", business_website: "", business_description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.DirectorySubmission.create({ ...form, type: "add_request", status: "pending" });
    setDone(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#110804] border border-[#c9a84c]/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#c9a84c]/10">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#c9a84c]" />
            <h2 className="font-heading text-lg text-[#f5ede0]">List Your Business</h2>
          </div>
          <button onClick={onClose} className="text-[#f5ede0]/40 hover:text-[#f5ede0]"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-[#f5ede0] font-semibold text-lg mb-2">Request Submitted!</h3>
            <p className="text-[#f5ede0]/50 text-sm font-sans">Our team will review your listing within 2-3 business days and contact you at {form.submitter_email}.</p>
            <Button onClick={onClose} className="mt-6 bg-[#c9a84c] text-[#0d0603] hover:bg-[#b8963e]">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-[#f5ede0]/50 text-xs font-sans">Fill in your details and we'll add your business to the Warri City Directory.</p>
            <div className="space-y-3">
              <p className="text-[#c9a84c] text-[10px] uppercase tracking-widest font-sans">Your Contact Info</p>
              <Input value={form.submitter_name} onChange={e => set("submitter_name", e.target.value)} placeholder="Your full name *" required className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
              <Input value={form.submitter_email} onChange={e => set("submitter_email", e.target.value)} placeholder="Your email *" type="email" required className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
              <Input value={form.submitter_phone} onChange={e => set("submitter_phone", e.target.value)} placeholder="Your phone number" className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
            </div>
            <div className="space-y-3">
              <p className="text-[#c9a84c] text-[10px] uppercase tracking-widest font-sans">Business Details</p>
              <Input value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="Business name *" required className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
              <select value={form.business_category} onChange={e => set("business_category", e.target.value)}
                className="w-full bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0] text-sm rounded-md px-3 py-2 font-sans focus:outline-none focus:ring-1 focus:ring-[#c9a84c]">
                <option value="">Select category</option>
                {(categories.length ? categories : [
                  { name: "Hotels" }, { name: "Restaurants" }, { name: "Lounges & Bars" }, { name: "Apartments" },
                  { name: "Hospitals" }, { name: "Markets" }, { name: "Banks" }, { name: "Schools" }, { name: "Businesses" }
                ]).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <Input value={form.business_address} onChange={e => set("business_address", e.target.value)} placeholder="Business address in Warri" className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
              <Input value={form.business_phone} onChange={e => set("business_phone", e.target.value)} placeholder="Business phone" className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
              <Input value={form.business_website} onChange={e => set("business_website", e.target.value)} placeholder="Website (optional)" className="bg-[#1a0a06] border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30" />
              <textarea value={form.business_description} onChange={e => set("business_description", e.target.value)} placeholder="Brief description of your business" rows={3}
                className="w-full bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 text-sm rounded-md px-3 py-2 font-sans focus:outline-none focus:ring-1 focus:ring-[#c9a84c] resize-none" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0603] font-bold">
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}