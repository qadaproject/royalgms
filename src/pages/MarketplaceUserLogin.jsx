import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff, User } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import { loginUser } from "@/lib/marketplaceAuth";
import { setGlobalMpUser } from "@/hooks/useMpUser";
import { toast } from "sonner";

export default function MarketplaceUserLogin() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/marketplace";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginUser(form.email, form.password);
      setGlobalMpUser(user);
      window.location.href = redirect;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider("google", window.location.origin + "/marketplace/google-callback");
  };

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
          <h1 className="font-heading text-3xl font-semibold">User Sign In</h1>
          <p className="text-muted-foreground text-sm mt-1">Royal Marketplace</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <Button variant="outline" className="w-full gap-2" onClick={handleGoogleLogin} type="button">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="flex-1 h-px bg-border" />
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Sign In
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            No account? <Link to="/marketplace/user-register" className="text-primary underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}