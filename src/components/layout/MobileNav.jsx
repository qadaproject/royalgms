import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, Send, Armchair, BarChart3, Bell, Shield, Settings, Mail } from "lucide-react";
import RoyalCrest from "./RoyalCrest";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/guests", label: "Guests", icon: Users },
  { path: "/invitation-manager", label: "Invitations", icon: Mail },
  { path: "/invitations", label: "Dispatch", icon: Send },
  { path: "/seating", label: "Seating", icon: Armchair },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/settings", label: "Event Settings", icon: Settings },
  { path: "/checkpoint", label: "Checkpoint", icon: Shield },
];

export default function MobileNav({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <RoyalCrest size="sm" />
          <span className="font-heading text-base font-semibold text-primary-foreground tracking-wide">
            Royal RSVP
          </span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-primary-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-primary/95 pt-20 px-6" onClick={() => setOpen(false)}>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                  location.pathname === item.path
                    ? "bg-accent/20 text-accent font-medium"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}