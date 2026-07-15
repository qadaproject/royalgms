import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import RoyalCrest from "@/components/layout/RoyalCrest";

export default function AdminProtectedRoute() {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          if (active) setState({ status: "unauthenticated" });
          return;
        }
        const me = await base44.auth.me();
        const allowed = await base44.entities.AllowedAdmin.filter(
          { email: me.email, is_active: true },
          "-created_date",
          1
        );
        if (!active) return;
        if (allowed && allowed.length > 0) {
          setState({ status: "authorized", user: me });
        } else {
          setState({ status: "denied", email: me.email });
        }
      } catch {
        if (active) setState({ status: "unauthenticated" });
      }
    })();
    return () => { active = false; };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="fixed inset-0 bg-[#0d0603] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin mx-auto mb-3" />
          <p className="text-[#f5ede0]/60 text-sm font-sans">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (state.status === "unauthenticated") {
    return <Navigate to="/admin-login" replace />;
  }

  if (state.status === "denied") {
    return (
      <div className="min-h-screen bg-[#0d0603] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-6"><RoyalCrest size="xl" /></div>
          <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-2xl p-8">
            <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h1 className="text-[#f5ede0] text-xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Access Denied
            </h1>
            <p className="text-red-400/80 text-xs font-sans leading-relaxed mb-6">
              {state.email} is not an authorised admin. Contact the system administrator.
            </p>
            <button
              onClick={() => base44.auth.logout("/admin-login")}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors text-sm font-sans"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
          <a href="/" className="inline-block mt-6 text-[#c9a84c]/40 hover:text-[#c9a84c]/70 text-xs font-sans transition-colors">
            ← Return to Public Site
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}