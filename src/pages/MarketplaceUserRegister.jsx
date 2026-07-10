import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff, User } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import { hashPassword, genToken } from "@/lib/marketplaceAuth";
import { toast } from "sonner";

const MARKETPLACE_EMAIL = "marketplace@royalgms.com";

export default function MarketplaceUserRegister() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) { toast.error("All fields are required"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const existing = await base44.entities.MarketplaceUser.filter({ email: form.email.trim().toLowerCase() });
      if (existing.length) { toast.error("An account with this email already exists."); setLoading(false); return; }

      const token = genToken();
      const hash = await hashPassword(form.password);
      const verifyLink = `${window.location.origin}/marketplace/verify-user?token=${token}`;

      await base44.entities.MarketplaceUser.create({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password_hash: hash,
        email_verified: false,
        is_active: false,
        email_verification_token: token,
      });

      await base44.functions.invoke("sendEmail", {
        to: form.email.trim(),
        from_name: "Royal Marketplace",
        from_email: MARKETPLACE_EMAIL,
        subject: "Verify your email — Royal Marketplace",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#7a1a1a;padding:24px;text-align:center;">
              <h1 style="color:#f5d78e;font-size:22px;margin:0;">Royal Marketplace</h1>
              <p style="color:#f5d78e80;margin:4px 0 0;">Warri Kingdom</p>
            </div>
            <div style="padding:32px 24px;background:#fff;">
              <h2 style="color:#1a1a1a;">Welcome, ${form.full_name}!</h2>
              <p style="color:#555;">Please verify your email address to activate your account.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${verifyLink}" style="background:#7a1a1a;color:#f5d78e;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;">Verify Email Address</a>
              </div>
              <p style="color:#888;font-size:13px;">Or copy: <a href="${verifyLink}" style="color:#7a1a1a;">${verifyLink}</a></p>
            </div>
            <div style="background:#f8f4ef;padding:16px 24px;text-align:center;">
              <p style="color:#888;font-size:12px;margin:0;">Royal Marketplace · <a href="mailto:${MARKETPLACE_EMAIL}" style="color:#7a1a1a;">${MARKETPLACE_EMAIL}</a></p>
            </div>
          </div>`,
      }).catch(() => {});

      setRegistered(true);
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (registered) return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">📧</span>
        </div>
        <h2 className="font-heading text-2xl font-semibold mb-3">Check Your Email!</h2>
        <p className="text-muted-foreground mb-6">A verification link has been sent to <strong>{form.email}</strong>. Click it to activate your account.</p>
        <Button variant="outline" asChild><Link to="/marketplace/user-login">Back to Sign In</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-12">
        <Link to="/marketplace/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Royal Marketplace — Shopper / User</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <Input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Account
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/marketplace/user-login" className="text-primary underline">Sign in</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Want to list your business? <Link to="/marketplace/register" className="text-primary underline">Register as Vendor</Link>
          </p>
        </div>
      </div>
    </div>
  );
}