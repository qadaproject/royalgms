import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, LayoutDashboard, Users, Send, Armchair, BarChart3,
  Bell, Shield, Settings, Mail, ClipboardList, Globe, Store, MapPin, BookUser, LogOut, Crown
} from "lucide-react";
import RoyalCrest from "./RoyalCrest";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "chairman", "data_manager", "dispatch_unit", "protocol_liaison", "security"] },
  { path: "/guests", label: "Guest Registry", icon: Users, roles: ["admin", "chairman", "data_manager", "protocol_liaison"] },
  { path: "/invitation-manager", label: "Invitations", icon: Mail, roles: ["admin", "chairman", "data_manager", "dispatch_unit", "protocol_liaison"] },
  { path: "/invitations", label: "Dispatch Tracker", icon: Send, roles: ["admin", "data_manager", "dispatch_unit"] },
  { path: "/seating", label: "Seating & Protocol", icon: Armchair, roles: ["admin", "chairman", "protocol_liaison"] },
  { path: "/notifications", label: "Notifications", icon: Bell, roles: ["admin", "chairman", "data_manager"] },
  { path: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "chairman", "data_manager"] },
  { path: "/settings", label: "Event Settings", icon: Settings, roles: ["admin", "chairman"] },
  { path: "/guest-update-log", label: "Guest Update Log", icon: ClipboardList, roles: ["admin", "chairman", "data_manager"] },
  { path: "/checkpoint", label: "Security Checkpoint", icon: Shield, roles: ["admin", "security"] },
  { path: "/admin/marketplace", label: "Marketplace Mgmt", icon: Store, roles: ["admin", "chairman"] },
  { path: "/admin/directory", label: "Directory Mgmt", icon: MapPin, roles: ["admin", "chairman"] },
  { path: "/admin/itsekiris", label: "Itsekiris Mgmt", icon: BookUser, roles: ["admin", "chairman"] },
  { path: "/admin/users", label: "User Management", icon: Users, roles: ["admin"] },
  { path: "/", label: "Public Homepage", icon: Globe, roles: ["admin", "chairman"] },
];

export default function MobileNav({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const userRole = user?.role || "admin";

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-sidebar z-50 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <RoyalCrest size="md" />
        </div>
        <button onClick={() => setOpen(!open)} className="text-sidebar-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-sidebar pt-16 flex flex-col" onClick={() => setOpen(false)}>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-sidebar-primary" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-sidebar-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.full_name || "Loading..."}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 capitalize">
                  {(userRole || "").replace("_", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors w-full px-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}