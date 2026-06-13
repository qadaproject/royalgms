import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, MapPin, Phone, Globe, ArrowRight, ChevronRight, Store, Plus, Filter } from "lucide-react";
import VendorCard from "../components/marketplace/VendorCard";
import CategoryGrid from "../components/marketplace/CategoryGrid";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors_public"],
    queryFn: () => base44.entities.Vendor.filter({ approval_status: "Approved" }, "-featured", 200),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["marketplace_categories"],
    queryFn: () => base44.entities.MarketplaceCategory.filter({ is_active: true }, "sort_order", 50),
  });

  const filtered = useMemo(() => {
    let list = vendors;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.business_name?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.services_products?.toLowerCase().includes(q) ||
        v.category_name?.toLowerCase().includes(q) ||
        v.location_city?.toLowerCase().includes(q) ||
        (v.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "all") {
      list = list.filter(v => v.category_id === selectedCategory);
    }
    if (priceRange !== "all") {
      list = list.filter(v => v.price_range === priceRange);
    }
    if (sortBy === "featured") {
      list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (sortBy === "newest") {
      list = [...list].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    return list;
  }, [vendors, search, selectedCategory, priceRange, sortBy]);

  const featured = vendors.filter(v => v.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent/80 text-primary-foreground py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[4px] text-primary-foreground/70 mb-3 font-body">Warri Kingdom</p>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-4">Royal Marketplace</h1>
          <p className="text-primary-foreground/80 text-lg mb-8 font-body max-w-2xl mx-auto">
            Discover trusted hotels, restaurants, vendors, and services in Warri and beyond.
          </p>
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search businesses, services, locations..."
                className="pl-9 h-12 bg-white text-foreground border-0 text-base"
              />
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0 h-12 font-semibold">
              <Link to="/marketplace/register">
                <Plus className="w-4 h-4 mr-1" /> List Your Business
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Category Filter Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${selectedCategory === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? "all" : cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && !search && selectedCategory === "all" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl font-semibold">Featured Businesses</h2>
              <Badge className="bg-accent text-accent-foreground text-xs">⭐ Featured</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(v => <VendorCard key={v.id} vendor={v} featured />)}
            </div>
          </div>
        )}

        {/* Filters + Grid */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-muted-foreground font-body">{filtered.length} listing{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="Budget">Budget</SelectItem>
                <SelectItem value="Mid-range">Mid-range</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-heading text-xl mb-2">No listings found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/marketplace/register">Register Your Business</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-secondary/40 border-t border-border py-12 px-4 text-center">
        <h3 className="font-heading text-2xl font-semibold mb-2">Are you a business owner?</h3>
        <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">Join the Royal Marketplace and reach thousands of guests and visitors to Warri Kingdom.</p>
        <Button asChild size="lg">
          <Link to="/marketplace/register"><Plus className="w-4 h-4 mr-2" />Register Your Business</Link>
        </Button>
      </div>
    </div>
  );
}