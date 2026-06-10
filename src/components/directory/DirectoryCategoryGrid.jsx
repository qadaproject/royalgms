const DEFAULT_CATEGORIES = [
  { id: "hotels", name: "Hotels", icon: "🏨", slug: "hotels" },
  { id: "restaurants", name: "Restaurants", icon: "🍽️", slug: "restaurants" },
  { id: "lounges", name: "Lounges & Bars", icon: "🍸", slug: "lounges" },
  { id: "apartments", name: "Apartments", icon: "🏢", slug: "apartments" },
  { id: "hospitals", name: "Hospitals", icon: "🏥", slug: "hospitals" },
  { id: "markets", name: "Markets", icon: "🛒", slug: "markets" },
  { id: "police", name: "Police Stations", icon: "🚓", slug: "police" },
  { id: "military", name: "Military Bases", icon: "🪖", slug: "military" },
  { id: "banks", name: "Banks & ATMs", icon: "🏦", slug: "banks" },
  { id: "churches", name: "Churches", icon: "⛪", slug: "churches" },
  { id: "mosques", name: "Mosques", icon: "🕌", slug: "mosques" },
  { id: "schools", name: "Schools", icon: "🎓", slug: "schools" },
  { id: "fuel", name: "Fuel Stations", icon: "⛽", slug: "fuel" },
  { id: "pharmacies", name: "Pharmacies", icon: "💊", slug: "pharmacies" },
  { id: "businesses", name: "Businesses", icon: "🏢", slug: "businesses" },
];

export default function DirectoryCategoryGrid({ categories, selected, onSelect, onClear }) {
  const displayCats = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] font-sans">Browse by Category</p>
        {selected && (
          <button onClick={onClear} className="text-[#f5ede0]/40 hover:text-[#c9a84c] text-xs font-sans">
            Clear filter
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {displayCats.map((cat) => {
          const isSelected = selected?.id === cat.id || selected?.slug === cat.slug;
          return (
            <button
              key={cat.id || cat.slug}
              onClick={() => onSelect(cat)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                isSelected
                  ? "border-[#c9a84c] bg-[#c9a84c]/10"
                  : "border-[#c9a84c]/10 bg-[#1a0a06] hover:border-[#c9a84c]/40 hover:bg-[#1a0a06]"
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`text-[10px] font-sans text-center leading-tight ${isSelected ? "text-[#c9a84c]" : "text-[#f5ede0]/50"}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}