import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, ArrowLeft, LayoutDashboard, Plus, User, LogOut } from "lucide-react";
import useMpUser, { logoutMpUser } from "@/hooks/useMpUser";

export default function MarketplaceNav() {
  const loc = useLocation();
  const { user } = useMpUser();

  return (
    <nav className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/marketplace" className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <span className="font-heading text-base font-semibold">Royal Marketplace</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/marketplace/my-dashboard">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden mr-1">
                    {user.photo_url ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" /> : user.full_name?.[0]}
                  </div>
                  <span className="hidden sm:inline">{user.full_name?.split(" ")[0]}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { logoutMpUser(); window.location.reload(); }}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/marketplace/login">
                <User className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </Button>
          )}
          <Button asChild variant={loc.pathname === "/marketplace/vendor-dashboard" ? "default" : "ghost"} size="sm">
            <Link to="/marketplace/vendor-dashboard">
              <LayoutDashboard className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Vendor</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant={loc.pathname === "/marketplace/register" ? "default" : "outline"}>
            <Link to="/marketplace/register">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">List Business</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}