import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, CheckCircle2, Loader2, Mail } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import { toast } from "sonner";

const STEPS = ["Business Info", "Contact & Location", "Media & Docs", "Review & Submit"];
const MARKETPLACE_EMAIL = "marketplace@royalgms.com";
const MARKETPLACE_NAME = "Royal Marketplace";

export default function VendorRegisterPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [form, setForm] = useState({
    business_name: "", owner_full_name: "", category_id: "", category_name: "",
    description: "", services_products: "", email: "", phone: "",
    website: "", location_address: "", location_city: "", location_state: "",
    price_range: "", opening_hours: "",
    social_facebook: "", social_instagram: "", social_twitter: "", social_whatsapp: "",
    logo_url: "", cover_image_url: "", reg_document_url: "", gallery_urls: [],
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["marketplace_categories"],
    queryFn: () => base44.entities.MarketplaceCategory.filter({ is_active: true }, "sort_order", 50),
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const uploadFile = async (file, setLoading, key) => {
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set(key, file_url);
    setLoading(false);
  };

  const uploadGallery = async (files) => {
    setUploadingGallery(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setForm(f => ({ ...f, gallery_urls: [...(f.gallery_urls || []), ...urls] }));
    setUploadingGallery(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!form.business_name || !form.owner_full_name || !form.email || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const verifyLink = `${window.location.origin}/marketplace/verify-email?token=${token}`;

    await base44.entities.Vendor.create({
      ...form,
      approval_status: "Pending",
      email_verified: false,
      email_verification_token: token,
    });

    // Send email verification
    await base44.functions.invoke("sendEmail", {
      to: form.email,
      from_name: MARKETPLACE_NAME,
      from_email: MARKETPLACE_EMAIL,
      subject: "Verify your email — Royal Marketplace",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#7a1a1a;padding:24px;text-align:center;">
            <h1 style="color:#f5d78e;font-size:22px;margin:0;">Royal Marketplace</h1>
            <p style="color:#f5d78e;opacity:0.8;margin:4px 0 0;">Warri Kingdom</p>
          </div>
          <div style="padding:32px 24px;background:#fff;">
            <h2 style="color:#1a1a1a;font-size:18px;">Verify Your Email Address</h2>
            <p style="color:#555;">Dear <strong>${form.owner_full_name}</strong>,</p>
            <p style="color:#555;">Thank you for registering <strong>${form.business_name}</strong> on the Royal Marketplace. Please verify your email address to activate your account.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${verifyLink}" style="background:#7a1a1a;color:#f5d78e;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;font-size:15px;">Verify Email Address</a>
            </div>
            <p style="color:#888;font-size:13px;">If the button doesn't work, copy and paste this link:<br/><a href="${verifyLink}" style="color:#7a1a1a;">${verifyLink}</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="color:#555;font-size:13px;"><strong>What happens next?</strong><br/>After verifying your email, our team will review your application within 2–3 business days. You will be notified at this email address once a decision is made.</p>
            <p style="color:#555;font-size:13px;">You can check your application status anytime at your <a href="${window.location.origin}/marketplace/vendor-dashboard" style="color:#7a1a1a;">Vendor Dashboard</a>.</p>
          </div>
          <div style="background:#f8f4ef;padding:16px 24px;text-align:center;">
            <p style="color:#888;font-size:12px;margin:0;">Royal Protocol Office · Warri Kingdom · <a href="mailto:${MARKETPLACE_EMAIL}" style="color:#7a1a1a;">${MARKETPLACE_EMAIL}</a></p>
          </div>
        </div>
      `,
    }).catch(() => {});

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="font-heading text-3xl font-semibold mb-3">Check Your Email!</h2>
        <p className="text-muted-foreground mb-2">Your application for <strong>{form.business_name}</strong> has been submitted.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 text-left space-y-1.5">
          <p>📧 A verification email has been sent to <strong>{form.email}</strong>.</p>
          <p>✅ Click the link in that email to verify your address.</p>
          <p>🔍 Our team will then review your listing within 2–3 business days.</p>
          <p>📊 Check your application status anytime via the <Link to="/marketplace/vendor-dashboard" className="underline font-semibold">Vendor Dashboard</Link>.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/marketplace"><ArrowLeft className="w-4 h-4 mr-2" />Back to Marketplace</Link>
        </Button>
      </div>
    </div>
  );

  const canNext = [
    form.business_name && form.owner_full_name && form.category_id,
    form.email && form.phone && form.location_city,
    true,
    form.business_name && form.email,
  ][step];

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold mb-1">List Your Business</h1>
          <p className="text-muted-foreground text-sm">Join the Royal Marketplace and reach thousands of visitors.</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden sm:block truncate ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-emerald-400" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          {/* Step 0 */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Business/Trade Name <span className="text-red-500">*</span></Label>
                  <Input value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="e.g. Warri Grand Hotel" /></div>
                <div className="space-y-1.5"><Label>Owner Full Name <span className="text-red-500">*</span></Label>
                  <Input value={form.owner_full_name} onChange={e => set("owner_full_name", e.target.value)} placeholder="Full legal name" /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select value={form.category_id} onValueChange={v => {
                  const cat = categories.find(c => c.id === v);
                  setForm(f => ({ ...f, category_id: v, category_name: cat?.name || "" }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Business Description</Label>
                <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe your business..." className="h-28" /></div>
              <div className="space-y-1.5"><Label>Services / Products Offered</Label>
                <Textarea value={form.services_products} onChange={e => set("services_products", e.target.value)} placeholder="List your main services or products, one per line..." className="h-24" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Price Range</Label>
                  <Select value={form.price_range} onValueChange={v => set("price_range", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Budget">Budget</SelectItem>
                      <SelectItem value="Mid-range">Mid-range</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Opening Hours</Label>
                  <Input value={form.opening_hours} onChange={e => set("opening_hours", e.target.value)} placeholder="e.g. Mon-Fri 8am-6pm" /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Tags (press Enter to add)</Label>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="e.g. boat hire, catering..." />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.tags.map(t => (
                    <Badge key={t} variant="secondary" className="text-xs cursor-pointer" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}>
                      {t} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Email Address <span className="text-red-500">*</span></Label>
                  <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="business@example.com" /></div>
                <div className="space-y-1.5"><Label>Phone Number <span className="text-red-500">*</span></Label>
                  <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+234 xxx xxx xxxx" /></div>
              </div>
              <div className="space-y-1.5"><Label>Website</Label>
                <Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://yourbusiness.com" /></div>
              <div className="space-y-1.5"><Label>Full Address</Label>
                <Input value={form.location_address} onChange={e => set("location_address", e.target.value)} placeholder="Street address" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>City <span className="text-red-500">*</span></Label>
                  <Input value={form.location_city} onChange={e => set("location_city", e.target.value)} placeholder="e.g. Warri" /></div>
                <div className="space-y-1.5"><Label>State</Label>
                  <Input value={form.location_state} onChange={e => set("location_state", e.target.value)} placeholder="e.g. Delta State" /></div>
              </div>
              <div className="space-y-3">
                <Label className="font-semibold">Social Media</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input value={form.social_facebook} onChange={e => set("social_facebook", e.target.value)} placeholder="Facebook URL" />
                  <Input value={form.social_instagram} onChange={e => set("social_instagram", e.target.value)} placeholder="Instagram URL" />
                  <Input value={form.social_twitter} onChange={e => set("social_twitter", e.target.value)} placeholder="Twitter/X URL" />
                  <Input value={form.social_whatsapp} onChange={e => set("social_whatsapp", e.target.value)} placeholder="WhatsApp number (234...)" />
                </div>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-3">
                  {form.logo_url && <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-border" />}
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingLogo}>
                      <span>{uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}Upload Logo</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], setUploadingLogo, "logo_url")} />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Cover / Banner Image</Label>
                <div className="flex items-center gap-3">
                  {form.cover_image_url && <img src={form.cover_image_url} alt="Cover" className="w-32 h-16 rounded-lg object-cover border border-border" />}
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingCover}>
                      <span>{uploadingCover ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}Upload Cover</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], setUploadingCover, "cover_image_url")} />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Gallery Images (up to 10)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.gallery_urls || []).map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-20 h-16 rounded-lg object-cover border border-border" />
                      <button type="button" onClick={() => setForm(f => ({ ...f, gallery_urls: f.gallery_urls.filter((_, j) => j !== i) }))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                    </div>
                  ))}
                </div>
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild disabled={uploadingGallery}>
                    <span>{uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}Add Photos</span>
                  </Button>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files.length && uploadGallery(Array.from(e.target.files))} />
                </label>
              </div>
              <div className="space-y-1.5">
                <Label>Company Registration Document (CAC, etc.)</Label>
                <div className="flex items-center gap-3">
                  {form.reg_document_url && <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-400">✓ Uploaded</Badge>}
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingDoc}>
                      <span>{uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}Upload Document</span>
                    </Button>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], setUploadingDoc, "reg_document_url")} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Accepted: PDF, JPG, PNG. Required for approval.</p>
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-heading text-base font-semibold">Review Your Application</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                {[
                  ["Business", form.business_name], ["Owner", form.owner_full_name],
                  ["Category", form.category_name], ["Email", form.email],
                  ["Phone", form.phone], ["City", `${form.location_city}${form.location_state ? `, ${form.location_state}` : ""}`],
                  ["Price Range", form.price_range],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">{l}:</span><span className="font-medium">{v}</span></div>
                ))}
                <div className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">Logo:</span><span>{form.logo_url ? "✓ Uploaded" : "Not uploaded"}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground w-32 shrink-0">Reg. Document:</span><span>{form.reg_document_url ? "✓ Uploaded" : "Not uploaded"}</span></div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 space-y-1.5">
                <p className="font-semibold">What happens after you submit:</p>
                <p>📧 A <strong>verification email</strong> will be sent to <strong>{form.email}</strong> — click the link to verify your account.</p>
                <p>🔍 Our team will <strong>manually review</strong> your application within 2–3 business days.</p>
                <p>📊 You can track your application status via the <strong>Vendor Dashboard</strong> at any time.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>← Previous</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext}>Next →</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || !canNext}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}