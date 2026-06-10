import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, MapPin, Star, Phone, Globe, Filter, SlidersHorizontal, Plus, Flag, ChevronRight, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DirectoryCategoryGrid from "@/components/directory/DirectoryCategoryGrid";
import DirectoryListingCard from "@/components/directory/DirectoryListingCard";
import DirectorySearchBar from "@/components/directory/DirectorySearchBar";
import AddBusinessDialog from "@/components/directory/AddBusinessDialog";

const PRICE_LABELS = { "₦": "Budget", "₦₦": "Mid-range", "₦₦₦": "Premium", "₦₦₦₦": "Luxury" };

export default function DirectoryPage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [googleResults, setGoogleResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [priceFilter, setPriceFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | google | manual

  useEffect(() => {
    base44.entities.DirectoryCategory.filter({ is_active: true }, "sort_order", 50).then(setCategories);
    base44.entities.DirectoryListing.filter({ status: "active" }, "-rating", 100).then(setListings);
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 5.5167, lng: 5.7500 }) // Default Warri
      );
    }
  }, []);

  const handleSearch = useCallback(async (query, catName) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("placesSearch", {
        query,
        category: catName || selectedCategory?.name,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
      });
      setGoogleResults(res.data?.places || []);
      setActiveTab("google");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [selectedCategory, userLocation]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    handleSearch("", cat.name);
  };

  // Filter manual listings
  const filteredListings = listings.filter((l) => {
    const matchCat = !selectedCategory || l.category === selectedCategory.name || l.category_id === selectedCategory.id;
    const matchSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = !priceFilter || l.price_range === priceFilter;
    return matchCat && matchSearch && matchPrice;
  }).sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  function getDistance(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lat2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }

  const displayResults = activeTab === "google" ? googleResults : filteredListings;

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
            onSearch={handleSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loading={loading}
          />
        </div>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <DirectoryCategoryGrid
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategoryClick}
            onClear={() => { setSelectedCategory(null); setActiveTab("all"); setGoogleResults([]); }}
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
            {/* Tabs */}
            <div className="flex gap-1 bg-[#1a0a06] rounded-lg p-1">
              {[["all", "Saved Listings"], ["google", "Live Search"]].map(([val, label]) => (
                <button key={val} onClick={() => setActiveTab(val)}
                  className={`px-3 py-1 rounded text-xs font-sans transition-colors ${activeTab === val ? "bg-[#c9a84c] text-[#0d0603] font-bold" : "text-[#f5ede0]/50 hover:text-[#f5ede0]"}`}>
                  {label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-[#1a0a06] border border-[#c9a84c]/20 text-[#f5ede0]/70 text-xs rounded-lg px-3 py-1.5 font-sans">
              <option value="rating">Sort: Best Rated</option>
              <option value="name">Sort: Name A-Z</option>
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
                <button onClick={() => { setSelectedCategory(null); setActiveTab("all"); }} className="ml-1 hover:text-white">×</button>
              </Badge>
            )}
          </div>

          {/* Results count */}
          <p className="text-[#f5ede0]/30 text-xs font-sans mb-4 uppercase tracking-widest">
            {loading ? "Searching..." : `${displayResults.length} ${selectedCategory?.name || "businesses"} found`}
          </p>

          {/* Results grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-[#1a0a06] rounded-xl animate-pulse border border-[#c9a84c]/10" />
              ))}
            </div>
          ) : displayResults.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-12 h-12 text-[#c9a84c]/30 mx-auto mb-4" />
              <p className="text-[#f5ede0]/40 font-sans text-sm">No results found. Try a different search or category.</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-4 border-[#c9a84c]/30 text-[#c9a84c]">
                <Plus className="w-4 h-4 mr-2" /> Add a Business
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayResults.map((item, i) => (
                <DirectoryListingCard
                  key={item.id || item.google_place_id || i}
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