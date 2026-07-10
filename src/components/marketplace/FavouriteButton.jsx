import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useMpUser from "@/hooks/useMpUser";
import { toast } from "sonner";

export default function FavouriteButton({ vendorId, className = "" }) {
  const { user, refresh } = useMpUser();
  const [loading, setLoading] = useState(false);

  const isFav = (user?.favorites_vendor_ids || []).includes(vendorId);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save favourites"); return; }
    setLoading(true);
    const current = user.favorites_vendor_ids || [];
    const updated = isFav ? current.filter(id => id !== vendorId) : [...current, vendorId];
    await base44.entities.MarketplaceUser.update(user.id, { favorites_vendor_ids: updated });
    await refresh();
    setLoading(false);
    toast.success(isFav ? "Removed from favourites" : "Added to favourites!");
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 transition-colors ${isFav ? "text-red-500" : "text-muted-foreground hover:text-red-400"} ${className}`}
      title={isFav ? "Remove from favourites" : "Add to favourites"}
    >
      <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
    </button>
  );
}