/**
 * Resolves a vendor by username slug and renders the VendorDetailPage.
 * Route: /marketplace/:username
 */
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function VendorProfileByUsername() {
  const { username } = useParams();
  const [vendorId, setVendorId] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | found | notfound

  useEffect(() => {
    if (!username) { setStatus("notfound"); return; }
    base44.entities.Vendor.filter({ username, approval_status: "Approved" })
      .then(results => {
        if (results.length) { setVendorId(results[0].id); setStatus("found"); }
        else setStatus("notfound");
      })
      .catch(() => setStatus("notfound"));
  }, [username]);

  if (status === "loading") return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </div>
  );

  if (status === "found" && vendorId) {
    return <Navigate to={`/marketplace/vendor?id=${vendorId}`} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🏪</p>
        <h2 className="font-heading text-2xl font-semibold mb-2">Vendor not found</h2>
        <p className="text-muted-foreground text-sm">No vendor found at <strong>/marketplace/{username}</strong>.</p>
      </div>
    </div>
  );
}