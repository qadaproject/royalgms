import { Badge } from "@/components/ui/badge";

const categoryStyles = {
  "A - Royal": "bg-accent/20 text-accent border-accent/30",
  "B - Federal": "bg-blue-500/10 text-blue-700 border-blue-500/20",
  "C - State": "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  "D - Corporate": "bg-purple-500/10 text-purple-700 border-purple-500/20",
  "E - Diplomatic": "bg-rose-500/10 text-rose-700 border-rose-500/20",
  "F - Traditional": "bg-orange-500/10 text-orange-700 border-orange-500/20",
  "G - General": "bg-slate-500/10 text-slate-700 border-slate-500/20",
  "H - Socials": "bg-teal-500/10 text-teal-700 border-teal-500/20",
  "I - Communities": "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  "J - Chiefs": "bg-amber-500/10 text-amber-800 border-amber-500/20",
};

export default function CategoryBadge({ category, compact }) {
  if (!category) return null;
  const label = compact ? category.split(" - ")[0] : category;
  return (
    <Badge variant="outline" className={`text-[10px] font-medium uppercase tracking-wider border ${categoryStyles[category] || "bg-muted text-muted-foreground"}`}>
      {label}
    </Badge>
  );
}