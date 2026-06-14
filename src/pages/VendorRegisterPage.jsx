import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Store, Mail } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import useMpUser from "@/hooks/useMpUser";
import { toast } from "sonner";

const MARKETPLACE_NAME = "Royal Marketplace";

export default function VendorRegisterPage() {
  const { user: mpUser } = useMpUser();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedBusiness, setSubmittedBusiness] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [form, setForm] = useState({
    business_name: "",
    owner_full_name: "",
    category_id: "",
    category_name: "",
    description: "",
    email: "",
    phone: "",
    location_city: "",
    location_state: "",
    price_range: "",
  });

  useEffect(() => {
    if (mpUser) {
      setForm(f => ({
        ...f,
        owner_full_name: mpUser.full_name || "",
        email: mpUser.email || "",
      }));
    }
  }, [mpUser?.id]);

  const { data: categories = [] } = useQuery({
    queryKey: ["marketplace_categories"],
    queryFn: () => base44.entities.MarketplaceCategory.filter({ is_active: true }, "sort_order", 50),
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.business_name || !form.owner_full_name || !form.email || !form.phone || !form.category_id) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);
      const verifyLink = `${window.location.origin}/marketplace/verify-email?token=${token}`;

      await base44.entities.Vendor.create({
        ...form,
        approval_status: "Pending",
        email_verified: false,
        email_verification_token: token,
        ...(mpUser?.id ? { user_id: mpUser.id } : {}),
      });

      await base44.functions.invoke("sendEmail", {
        to: form.email,
        from_name: MARKETPLACE_NAME,
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
              <p style="color:#555;">Thank you for registering <strong>${form.business_name}</strong> on the Royal Marketplace. Please verify your email to activate your account.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${verifyLink}" style="background:#7a1a1a;color:#f5d78e;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;font-size:15px;">Verify Email Address</a>
              </div>
              <p style="color:#888;font-size:13px;">If the button doesn't work, copy and paste:<br/><a href="${verifyLink}" style="color:#7a1a1a;">${verifyLink}</a></p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
              <p style="color:#555;font-size:13px;"><strong>What happens next?</strong><br/>After verifying your email, our team will review your application. Once approved, you can add products and services — each listing requires admin approval before it appears publicly in the marketplace.</p>
              <p style="color:#555;font-size:13px;">Track your status anytime at your <a href="${window.location.origin}/marketplace/vendor-dashboard" style="color:#7a1a1a;">Vendor Dashboard</a>.</p>
            </div>
            <div style="background:#f8f4ef;padding:16px 24px;text-align:center;">
              <p style="color:#888;font-size:12px;margin:0;">Royal Protocol Office · Warri Kingdom</p>
            </div>
          </div>
        `,
      }).catch(() => {});

      setSubmittedBusiness(form.business_name);
      setSubmittedEmail(form.email);
      setSubmitted(true);
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (!mpUser) return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Store className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
        <h2 className="font-heading text-2xl font-semibold mb-2">Sign in to Register</h2>
        <p className="text-muted-foreground text-sm mb-6">You need a marketplace account to list your business.</p>
        <Button asChild><Link to="/marketplace/login">Sign In / Register</Link></Button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="font-heading text-3xl font-semibold mb-3">Check Your Email!</h2>
        <p className="text-muted-foreground mb-4">Your application for <strong>{submittedBusiness}</strong> has been submitted.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 text-left space-y-1.5">
          <p>📧 A verification email has been sent to <strong>{submittedEmail}</strong>.</p>
          <p>✅ Click the link in that email to verify your address.</p>
          <p>🔍 Our team will review your application within 2–3 business days.</p>
          <p>📦 Once approved, you can add products/services — each listing also requires admin approval before going live.</p>
          <p>📊 Track your status via the <Link to="/marketplace/vendor-dashboard" className="underline font-semibold">Vendor Dashboard</Link>.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/marketplace"><ArrowLeft className="w-4 h-4 mr-2" />Back to Marketplace</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-xl mx-auto px-4 py-10">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-semibold mb-1">List Your Business</h1>
          <p className="text-muted-foreground text-sm">Fill in your business details. After email verification and admin approval, you can add products and services.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Business Name <span className="text-red-500">*</span></Label>
              <Input value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="e.g. Warri Grand Hotel" />
            </div>
            <div className="space-y-1.5">
              <Label>Owner Name <span className="text-red-500">*</span></Label>
              <Input value={form.owner_full_name} onChange={e => set("owner_full_name", e.target.value)} placeholder="Full legal name" />
            </div>
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

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe your business..." className="h-24" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="business@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone <span className="text-red-500">*</span></Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+234 xxx xxx xxxx" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.location_city} onChange={e => set("location_city", e.target.value)} placeholder="e.g. Warri" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.location_state} onChange={e => set("location_state", e.target.value)} placeholder="e.g. Delta State" />
            </div>
          </div>

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

          <Button onClick={handleSubmit} disabled={submitting} className="w-full mt-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : "Submit Application"}
          </Button>
        </div>
      </div>
    </div>
  );
}