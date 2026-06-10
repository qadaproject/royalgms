import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Download, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRICE_MAP = { 0: "₦", 1: "₦", 2: "₦₦", 3: "₦₦₦", 4: "₦₦₦₦" };

export default function GoogleImportTool({ categories, onImported }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSelected(new Set());
    const res = await base44.functions.invoke("placesSearch", { query });
    setResults(res.data?.places || []);
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(results.map((_, i) => i)));
  const clearAll = () => setSelected(new Set());

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    const toImport = results.filter((_, i) => selected.has(i));

    for (const place of toImport) {
      // Fetch full details for phone/website
      let details = place;
      if (place.google_place_id) {
        try {
          const r = await base44.functions.invoke("placeDetails", { place_id: place.google_place_id });
          if (r.data?.place) details = { ...place, ...r.data.place };
        } catch {}
      }
      await base44.entities.DirectoryListing.create({
        name: details.name,
        category: details.category || query,
        address: details.address,
        phone: details.phone || null,
        website: details.website || null,
        description: details.description || null,
        latitude: details.latitude,
        longitude: details.longitude,
        rating: details.rating || 0,
        review_count: details.review_count || 0,
        price_range: PRICE_MAP[details.price_level] || null,
        photo_url: details.photo_url || null,
        opening_hours: details.opening_hours || null,
        google_place_id: details.google_place_id,
        city: "Warri",
        state: "Delta State",
        status: "active",
        source: "google",
      });
    }

    setImported(prev => { const n = new Set(prev); selected.forEach(i => n.add(i)); return n; });
    setImporting(false);
    onImported();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-heading text-base font-semibold mb-1">Import from Google Maps</h3>
      <p className="text-muted-foreground text-xs font-sans mb-4">Search Google Maps for businesses in Warri and save them to the directory database.</p>

      <div className="flex gap-2 mb-4">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="e.g. Hotels in Warri, Restaurants Warri..."
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">{results.length} results — {selected.size} selected</p>
            <div className="flex gap-2 text-xs">
              <button onClick={selectAll} className="text-primary hover:underline">Select all</button>
              <button onClick={clearAll} className="text-muted-foreground hover:underline">Clear</button>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
            {results.map((p, i) => (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected.has(i) ? "border-primary bg-primary/5" : "border-border hover:border-border/80"} ${imported.has(i) ? "opacity-50 pointer-events-none" : ""}`}>
                <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} className="accent-primary shrink-0" />
                {p.photo_url && <img src={p.photo_url} alt={p.name} className="w-10 h-10 rounded object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.address}</p>
                  {p.rating > 0 && <p className="text-xs text-amber-600">★ {p.rating} ({p.review_count})</p>}
                </div>
                {imported.has(i) && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </label>
            ))}
          </div>
          <Button onClick={handleImport} disabled={importing || selected.size === 0} className="w-full gap-2">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {importing ? "Importing..." : `Import ${selected.size} listing${selected.size !== 1 ? "s" : ""} to Database`}
          </Button>
        </>
      )}

      {!loading && results.length === 0 && query && (
        <p className="text-center text-muted-foreground text-sm py-4">No results. Try a different search term.</p>
      )}
    </div>
  );
}