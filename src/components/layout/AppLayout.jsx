import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/lib/AuthContext";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppLayout() {
  const { user } = useContext(AuthContext);

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
