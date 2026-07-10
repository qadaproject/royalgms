import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff, ShoppingBag } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import { loginVendor } from "@/lib/marketplaceAuth";
import { toast } from "sonner";

export default function VendorLoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "/marketplace/vendor-dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const vendor = await loginVendor(form.email, form.password);
      // Store vendor session
      sessionStorage.setItem("mp_vendor_session", JSON.stringify(vendor));
      window.location.href = redirect;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-12">
        <Link to="/marketplace/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold">Vendor Sign In</h1>
          <p className="text-muted-foreground text-sm mt-1">Royal Marketplace — Business Portal</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Business Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="business@example.com" required />
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Sign In to Dashboard
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            New vendor? <Link to="/marketplace/register" className="text-primary underline">Register your business</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Not a vendor? <Link to="/marketplace/user-login" className="text-primary underline">User sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}