export default function CategoryGrid({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={() => onSelect("all")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
          ${selected === "all" ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border hover:border-primary/50 text-foreground"}`}
      >
        <span>🏪</span> All
      </button>
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(selected === c.id ? "all" : c.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
            ${selected === c.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border hover:border-primary/50 text-foreground"}`}
        >
          <span>{c.icon || "🏪"}</span>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}