import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DirectoryCategoryGrid from "@/components/directory/DirectoryCategoryGrid";
import DirectoryListingCard from "@/components/directory/DirectoryListingCard";
import DirectorySearchBar from "@/components/directory/DirectorySearchBar";
import AddBusinessDialog from "@/components/directory/AddBusinessDialog";

export default function DirectoryPage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [priceFilter, setPriceFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    base44.entities.DirectoryCategory.filter({ is_active: true }, "sort_order", 50).then(setCategories);
    base44.entities.DirectoryListing.filter({ status: "active" }, "-rating", 200).then(setListings);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 5.5167, lng: 5.7500 })
      );
    }
  }, []);

  function getDistance(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lat2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchCat = !selectedCategory || l.category === selectedCategory.name || l.category_id === selectedCategory.id;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.address?.toLowerCase().includes(q) || l.category?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
      const matchPrice = !priceFilter || l.price_range === priceFilter;
      return matchCat && matchSearch && matchPrice;
    }).sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "distance") {
        const da = getDistance(userLocation?.lat, userLocation?.lng, a.latitude, a.longitude);
        const db = getDistance(userLocation?.lat, userLocation?.lng, b.latitude, b.longitude);
        if (!da) return 1;
        if (!db) return -1;
        return parseFloat(da) - parseFloat(db);
      }
      return 0;
    });
  }, [listings, selectedCategory, searchQuery, priceFilter, sortBy, userLocation]);

  return (
    <div className="min-h-screen bg-[#0d0603] text-[#f5ede0]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0603]/95 backdrop-blur-md border-b border-[#c9a84c]/20">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-[#c9a84c] text-[9px] uppercase tracking-[0.25em] font-sans">Royal Palace</span>
            <span className="text-[#f5ede0] text-sm font-semibold tracking-wider">Warri Kingdom</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[#f5ede0]/50 hover:text-[#c9a84c] text-xs uppercase tracking-widest font-sans">← Home</Link>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              className="bg-[#c9a84c] hover:bg-[#b8963e] text-[#0d0603] font-bold text-xs gap-1"
            >
              <Plus className="w-3 h-3" /> List Your Business
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16">
        <div className="relative bg-gradient-to-b from-[#1a0a06] to-[#0d0603] py-16 px-4 text-center">
          <p className="text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-sans mb-3">Warri Metropolis · Delta State</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#f5ede0] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Warri City Directory
          </h1>
          <p className="text-[#f5ede0]/50 text-sm font-sans mb-8 max-w-xl mx-auto">
            Discover hotels, restaurants, hospitals, markets, and more across Warri metropolis
          </p>
          <DirectorySearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <DirectoryCategoryGrid
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            onClear={() => setSelectedCategory(null)}
          />
        </div>

        {/* Filters + Results */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <div className="flex items-center gap-2 text-[#f5ede0]/50 text-xs font-sans">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0]/70 text-xs rounded-lg px-3 py-1.5 font-sans">
              <option value="rating">Best Rated</option>
              <option value="name">Name A–Z</option>
              <option value="distance">Nearest First</option>
            </select>
            {/* Price filter */}
            {["₦", "₦₦", "₦₦₦", "₦₦₦₦"].map(p => (
              <button key={p} onClick={() => setPriceFilter(priceFilter === p ? "" : p)}
                className={`px-3 py-1 rounded-lg text-xs font-sans border transition-colors ${priceFilter === p ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]" : "border-[#c9a84c]/20 text-[#f5ede0]/50 hover:border-[#c9a84c]/50"}`}>
                {p}
              </button>
            ))}
            {selectedCategory && (
              <Badge className="bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30 gap-1">
                {selectedCategory.icon} {selectedCategory.name}
                <button onClick={() => setSelectedCategory(null)} className="ml-1 hover:text-white">×</button>
              </Badge>
            )}
          </div>

          {/* Results count */}
          <p className="text-[#f5ede0]/30 text-xs font-sans mb-4 uppercase tracking-widest">
            {filteredListings.length} {selectedCategory?.name || "businesses"} found
          </p>

          {/* Results grid */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-12 h-12 text-[#c9a84c]/30 mx-auto mb-4" />
              <p className="text-[#f5ede0]/40 font-sans text-sm mb-2">No results found.</p>
              <p className="text-[#f5ede0]/25 font-sans text-xs mb-6">Try a different search or category, or submit your business for listing.</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" className="border-[#c9a84c]/30 text-[#c9a84c]">
                <Plus className="w-4 h-4 mr-2" /> Add a Business
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((item) => (
                <DirectoryListingCard
                  key={item.id}
                  listing={item}
                  userLocation={userLocation}
                  getDistance={getDistance}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddDialog && <AddBusinessDialog onClose={() => setShowAddDialog(false)} categories={categories} />}
    </div>
  );
}