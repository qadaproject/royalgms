export default function StarRating({ rating = 0, size = "sm" }) {
  const sizes = { xs: "text-xs", sm: "text-sm", md: "text-base", lg: "text-lg" };
  return (
    <div className={`flex items-center gap-0.5 ${sizes[size] || sizes.sm}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-amber-400" : "text-muted-foreground/20"}>★</span>
      ))}
    </div>
  );
}