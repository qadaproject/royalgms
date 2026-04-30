import { Crown } from "lucide-react";

export default function RoyalCrest({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center`}>
      <div className="absolute inset-0 bg-accent/20 rounded-full blur-md" />
      <div className="relative bg-primary rounded-full flex items-center justify-center w-full h-full border-2 border-accent/50">
        <Crown className={`text-accent ${size === "lg" ? "w-10 h-10" : size === "md" ? "w-6 h-6" : "w-4 h-4"}`} />
      </div>
    </div>
  );
}