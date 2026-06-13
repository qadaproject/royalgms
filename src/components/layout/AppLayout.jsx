import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Loader2 } from "lucide-react";

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    window.location.href = "/admin";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav user={user} />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}