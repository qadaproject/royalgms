import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function MarketplaceUserVerify() {
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setStatus("error"); return; }
    verify(token);
  }, []);

  const verify = async (token) => {
    try {
      const users = await base44.entities.MarketplaceUser.filter({ email_verification_token: token });
      if (!users.length) { setStatus("error"); return; }
      const user = users[0];
      await base44.entities.MarketplaceUser.update(user.id, {
        email_verified: true,
        is_active: true,
        email_verification_token: "",
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-heading text-3xl font-semibold mb-3">Email Verified!</h2>
            <p className="text-muted-foreground mb-6">Your account is now active. You can sign in and start commenting, favouriting vendors, and more.</p>
            <Button asChild>
              <Link to="/marketplace/login">Sign In to Your Account</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-heading text-3xl font-semibold mb-3">Invalid Link</h2>
            <p className="text-muted-foreground mb-6">This verification link is invalid or has already been used.</p>
            <Button asChild variant="outline">
              <Link to="/marketplace">Back to Marketplace</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}