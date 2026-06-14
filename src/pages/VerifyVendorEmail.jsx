import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function VerifyVendorEmail() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }

    base44.entities.Vendor.filter({ email_verification_token: token }).then(results => {
      if (results.length === 0) { setStatus("error"); return; }
      const v = results[0];
      base44.entities.Vendor.update(v.id, { email_verified: true }).then(() => {
        setVendor(v);
        setStatus("success");
      });
    }).catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-14 h-14 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="font-heading text-2xl font-semibold">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-2">
              Thank you, <strong>{vendor?.owner_full_name}</strong>! Your email has been verified.
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Your application for <strong>{vendor?.business_name}</strong> is now in the review queue.
              Our team will assess your listing within 2–3 business days.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/marketplace/vendor-login">Sign In to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace">Back to Marketplace</Link>
              </Button>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-2">Invalid or Expired Link</h2>
            <p className="text-muted-foreground text-sm mb-6">
              This verification link is invalid or has already been used. If you need help, contact us at{" "}
              <a href="mailto:marketplace@royalgms.com" className="text-primary underline">marketplace@royalgms.com</a>.
            </p>
            <Button asChild variant="outline">
              <Link to="/marketplace/vendor-dashboard">Back to Dashboard</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}