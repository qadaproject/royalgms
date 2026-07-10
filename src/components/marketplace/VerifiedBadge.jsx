import { BadgeCheck } from "lucide-react";

/**
 * Gold verified badge — shown next to vendor names when is_verified is true.
 * size: "sm" (w-4 h-4), "md" (w-5 h-5), "lg" (w-6 h-6)
 */
export default function VerifiedBadge({ size = "sm" }) {
  const sizeClass = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <span title="Verified Vendor" className="inline-flex shrink-0 items-center">
      <BadgeCheck
        className={`${sizeClass} text-white`}
        style={{
          fill: "#f59e0b",       /* amber-500 gold fill */
          color: "#ffffff",      /* white checkmark */
          filter: "drop-shadow(0 1px 3px rgba(245,158,11,0.6))",
        }}
      />
    </span>
  );
}