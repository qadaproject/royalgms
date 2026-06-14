// Redirects /marketplace/:username to /marketplace/vendor?id=...
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function VendorByUsername() {
  const { username } = useParams();

  useEffect(() => {
    if (!username) { window.location.href = "/marketplace"; return; }
    base44.entities.Vendor.filter({ username, approval_status: "Approved" }).then(results => {
      if (results.length) {
        window.location.href = `/marketplace/vendor?id=${results[0].id}`;
      } else {
        window.location.href = "/marketplace";
      }
    }).catch(() => { window.location.href = "/marketplace"; });
  }, [username]);

  return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </div>
  );
}