import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2 } from "lucide-react";
import RoyalCrest from "@/components/layout/RoyalCrest";
import GoogleIcon from "@/components/GoogleIcon";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0a06] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <RoyalCrest size="lg" />
          </div>
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] mb-1">Royal Guest Management System</p>
          <h1 className="font-heading text-2xl font-semibold text-[#f5ede0]">Admin Portal</h1>
          <div className="w-16 h-px bg-[#c9a84c]/40 mx-auto mt-3" />
        </div>

        {/* Card */}
        <div className="bg-[#2a110a]/80 border border-[#c9a84c]/20 rounded-xl p-8">
          <button
            onClick={handleGoogle}
            className="w-full h-11 flex items-center justify-center gap-3 mb-6 rounded-lg border border-[#c9a84c]/30 bg-[#1a0a06]/40 text-[#f5ede0]/80 text-sm font-medium hover:bg-[#1a0a06]/70 hover:border-[#c9a84c]/50 transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Sign in with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#c9a84c]/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#2a110a] px-3 text-[#f5ede0]/40 tracking-wider">or</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#f5ede0]/70 text-xs uppercase tracking-wider font-sans">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a84c]/60" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-[#1a0a06]/60 border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:border-[#c9a84c]/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#f5ede0]/70 text-xs uppercase tracking-wider font-sans">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a84c]/60" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-[#1a0a06]/60 border-[#c9a84c]/20 text-[#f5ede0] placeholder:text-[#f5ede0]/30 focus:border-[#c9a84c]/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#c9a84c] hover:bg-[#b8963e] text-[#1a0a06] font-semibold tracking-wide mt-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[#f5ede0]/20 text-xs mt-6 font-sans">
          © {new Date().getFullYear()} Ogiame Atuwatse III Royal Court. Restricted Access.
        </p>
      </div>
    </div>
  );
}