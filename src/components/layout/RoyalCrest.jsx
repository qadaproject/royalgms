export default function RoyalCrest({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center shrink-0`}>
      <img
        src="https://atuwatseiii.com/images/logo.png"
        alt="Royal Crest – Ogiame Atuwatse III"
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextSibling.style.display = "flex";
        }}
      />
      {/* Fallback crown */}
      <div
        style={{ display: "none" }}
        className="absolute inset-0 bg-accent/20 rounded-full flex items-center justify-center border border-accent/40"
      >
        <span className={`text-accent font-heading font-bold ${size === "lg" || size === "xl" ? "text-3xl" : "text-base"}`}>✦</span>
      </div>
    </div>
  );
}