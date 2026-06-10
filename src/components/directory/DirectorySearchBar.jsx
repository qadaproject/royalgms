import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export default function DirectorySearchBar({ onSearch, searchQuery, setSearchQuery, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex gap-2 bg-[#1a0a06] border border-[#c9a84c]/30 rounded-xl p-1.5 focus-within:border-[#c9a84c]/60">
        <div className="flex-1 flex items-center gap-3 px-3">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#c9a84c]/50 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-[#c9a84c]/50 shrink-0" />
          )}
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search hotels, restaurants, hospitals in Warri..."
            className="flex-1 bg-transparent text-[#f5ede0] placeholder:text-[#f5ede0]/30 text-sm font-sans focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-50 text-[#0d0603] font-bold px-5 py-2 rounded-lg text-sm font-sans transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}