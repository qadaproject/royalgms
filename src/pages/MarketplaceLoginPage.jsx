import { Link } from "react-router-dom";
import { Store, User, ShoppingBag } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function MarketplaceLoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Store className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h1 className="font-heading text-3xl font-semibold mb-2">Sign In</h1>
        <p className="text-muted-foreground text-sm mb-10">Choose how you'd like to sign in</p>

        <div className="grid gap-4">
          <Link to="/marketplace/user-login"
            className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all text-left group">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Marketplace User</p>
              <p className="text-xs text-muted-foreground mt-0.5">Browse, favourite, and review vendors</p>
            </div>
          </Link>

          <Link to="/marketplace/vendor-login"
            className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all text-left group">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
              <ShoppingBag className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">Vendor / Business Owner</p>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your listings and products</p>
            </div>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link to="/marketplace/user-register" className="text-primary underline">Register as User</Link>
          {" · "}
          <Link to="/marketplace/register" className="text-primary underline">Register as Vendor</Link>
        </p>
      </div>
    </div>
  );
}