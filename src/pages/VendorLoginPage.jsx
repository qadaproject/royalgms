import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Mail, Lock, Loader2 } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const results = await base44.entities.Vendor.filter({ email: email.trim().toLowerCase() });
      if (results.length === 0) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }
      const vendor = results[0];
      if (!vendor.password) {
        setError("This account has no password set. Please re-register or contact support.");
        setLoading(false);
        return;
      }
      if (vendor.password !== password) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }
      // Store vendor session
      sessionStorage.setItem("vendor_session", JSON.stringify({ id: vendor.id, email: vendor.email }));
      window.location.href = "/marketplace/vendor/dashboard";
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold mb-2">Vendor Login</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage your business listing.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Business Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoFocus
                  placeholder="your@business.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center space-y-2 text-sm text-muted-foreground">
            <p>Don't have an account? <Link to="/marketplace/register" className="text-primary font-medium hover:underline">Register here</Link></p>
            <p>Need help? <a href="mailto:marketplace@royalgms.com" className="text-primary hover:underline">marketplace@royalgms.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}