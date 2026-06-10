import { Search } from "lucide-react";

export default function DirectorySearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 bg-[#1a0a06] border border-[#c9a84c]/30 rounded-xl px-4 py-3 focus-within:border-[#c9a84c]/60">
        <Search className="w-4 h-4 text-[#c9a84c]/50 shrink-0" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search hotels, restaurants, hospitals in Warri..."
          className="flex-1 bg-transparent text-[#f5ede0] placeholder:text-[#f5ede0]/30 text-sm font-sans focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-[#f5ede0]/30 hover:text-[#f5ede0] text-lg leading-none">×</button>
        )}
      </div>
    </div>
  );
}