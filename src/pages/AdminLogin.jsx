import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Crown, AlertTriangle } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import RoyalCrest from "@/components/layout/RoyalCrest";

export default function AdminLogin() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  // After Google OAuth redirect, verify the logged-in user's email is on the allowlist
  useEffect(() => {
    const verifyAfterOAuth = async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) return;
        // Already logged in — check allowlist then redirect
        setChecking(true);
        const me = await base44.auth.me();
        const allowed = await base44.entities.AllowedAdmin.filter({ email: me.email, is_active: true }, "-created_date", 1);
        if (allowed && allowed.length > 0) {
          window.location.href = "/dashboard";
        } else {
          // Not on allowlist — log them out
          await base44.auth.logout();
          setError(`Access denied. ${me.email} is not an authorised admin. Contact the system administrator.`);
          setChecking(false);
        }
      } catch {
        setChecking(false);
      }
    };
    verifyAfterOAuth();
  }, []);

  const handleGoogle = () => {
    setError("");
    base44.auth.loginWithProvider("google", "/admin-login");
  };

  if (checking) return (
    <div className="min-h-screen bg-[#0d0603] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#c9a84c] animate-spin mx-auto mb-3" />
        <p className="text-[#f5ede0]/60 text-sm font-sans">Verifying access...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0603] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Crest */}
        <div className="flex flex-col items-center mb-10">
          <RoyalCrest size="xl" />
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mt-4 mb-1">Royal Guests Management System</p>
          <h1 className="text-[#f5ede0] text-2xl font-semibold tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Admin Access
          </h1>
          <p className="text-[#f5ede0]/40 text-xs font-sans mt-1">Authorised personnel only</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a0a06] border border-[#c9a84c]/20 rounded-2xl p-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs font-sans leading-relaxed">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors text-sm font-sans"
          >
            <GoogleIcon className="w-5 h-5" />
            Sign in with Google
          </button>

          <p className="text-center text-[#f5ede0]/25 text-[10px] font-sans uppercase tracking-widest mt-6">
            Restricted to authorised email addresses only
          </p>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-[#c9a84c]/40 hover:text-[#c9a84c]/70 text-xs font-sans transition-colors">
            ← Return to Public Site
          </a>
        </div>
      </div>
    </div>
  );
}