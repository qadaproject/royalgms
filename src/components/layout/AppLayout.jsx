import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import AdminWhatsAppNotif from "../whatsapp/AdminWhatsAppNotif";

export default function AppLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

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
      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex sticky top-0 z-40 h-14 bg-background/90 backdrop-blur border-b border-border items-center justify-end px-6">
          <AdminWhatsAppNotif />
        </div>
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6 flex-1">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}