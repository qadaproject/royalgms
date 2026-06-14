import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff, Store } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import { loginUser, hashPassword, genToken, setMpSession } from "@/lib/marketplaceAuth";
import { setGlobalMpUser } from "@/hooks/useMpUser";
import { toast } from "sonner";

const MARKETPLACE_EMAIL = "marketplace@royalgms.com";

export default function MarketplaceLoginPage() {
  const [tab, setTab] = useState("login"); // login | register
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [registered, setRegistered] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/marketplace";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginUser(loginForm.email, loginForm.password);
      setGlobalMpUser(user);
      window.location.href = redirect;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.full_name || !regForm.email || !regForm.password) { toast.error("All fields are required"); return; }
    if (regForm.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (regForm.password !== regForm.confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      // Check if email already exists
      const existing = await base44.entities.MarketplaceUser.filter({ email: regForm.email.trim().toLowerCase() });
      if (existing.length) { toast.error("An account with this email already exists."); setLoading(false); return; }

      const token = genToken();
      const hash = await hashPassword(regForm.password);
      const verifyLink = `${window.location.origin}/marketplace/verify-user?token=${token}`;

      await base44.entities.MarketplaceUser.create({
        full_name: regForm.full_name.trim(),
        email: regForm.email.trim().toLowerCase(),
        password_hash: hash,
        email_verified: false,
        is_active: false,
        email_verification_token: token,
      });

      await base44.functions.invoke("sendEmail", {
        to: regForm.email.trim(),
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
              <h2 style="color:#1a1a1a;">Welcome, ${regForm.full_name}!</h2>
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

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider("google", window.location.origin + "/marketplace/google-callback");
  };

  if (registered) return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">📧</span>
        </div>
        <h2 className="font-heading text-2xl font-semibold mb-3">Check Your Email!</h2>
        <p className="text-muted-foreground mb-6">A verification link has been sent to <strong>{regForm.email}</strong>. Click it to activate your account.</p>
        <Button variant="outline" onClick={() => { setRegistered(false); setTab("login"); }}>Back to Login</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Store className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h1 className="font-heading text-3xl font-semibold">
            {tab === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Royal Marketplace</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button onClick={() => setTab("login")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === "login" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>Sign In</button>
          <button onClick={() => setTab("register")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === "register" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>Register</button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {/* Google */}
          <Button variant="outline" className="w-full gap-2" onClick={handleGoogleLogin} type="button">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" />
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Sign In
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Are you a vendor? <Link to="/marketplace/vendor-dashboard" className="text-primary underline">Vendor Dashboard</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={regForm.full_name} onChange={e => setRegForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your full name" required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" required />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <Input type="password" value={regForm.confirm} onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Account
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Want to list your business? <Link to="/marketplace/register" className="text-primary underline">Register as Vendor</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}