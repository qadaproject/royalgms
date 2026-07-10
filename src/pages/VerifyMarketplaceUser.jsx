import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function VerifyMarketplaceUser() {
  const [status, setStatus] = useState("loading");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }

    base44.entities.MarketplaceUser.filter({ email_verification_token: token }).then(results => {
      if (!results.length) { setStatus("error"); return; }
      const u = results[0];
      base44.entities.MarketplaceUser.update(u.id, { email_verified: true, is_active: true }).then(() => {
        setUserName(u.full_name);
        setStatus("success");
      });
    }).catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {status === "loading" && <><Loader2 className="w-14 h-14 mx-auto mb-4 text-primary animate-spin" /><h2 className="font-heading text-2xl font-semibold">Verifying...</h2></>}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-6">Welcome, <strong>{userName}</strong>! Your account is now active. You can now sign in.</p>
            <Button asChild><Link to="/marketplace/login">Sign In Now</Link></Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground text-sm mb-6">This link is invalid or already used. Contact <a href="mailto:marketplace@royalgms.com" className="text-primary underline">marketplace@royalgms.com</a>.</p>
            <Button asChild variant="outline"><Link to="/marketplace/login">Back to Login</Link></Button>
          </>
        )}
      </div>
    </div>
  );
}