import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRICE_RANGES = ["₦", "₦₦", "₦₦₦", "₦₦₦₦"];
const STATUSES = ["active", "pending", "suspended"];

export default function DirectoryListingForm({ listing, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: listing?.name || "",
    category: listing?.category || "",
    description: listing?.description || "",
    address: listing?.address || "",
    city: listing?.city || "Warri",
    state: listing?.state || "Delta State",
    phone: listing?.phone || "",
    website: listing?.website || "",
    email: listing?.email || "",
    price_range: listing?.price_range || "",
    opening_hours: listing?.opening_hours || "",
    photo_url: listing?.photo_url || "",
    latitude: listing?.latitude || "",
    longitude: listing?.longitude || "",
    status: listing?.status || "active",
    is_featured: listing?.is_featured || false,
    tags: listing?.tags?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    if (listing?.id) {
      await base44.entities.DirectoryListing.update(listing.id, data);
    } else {
      await base44.entities.DirectoryListing.create({ ...data, source: "manual" });
    }
    setLoading(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg font-semibold">{listing ? "Edit Listing" : "Add New Listing"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Business Name *</label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full h-9 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select category</option>
                {(categories.length ? categories : [
                  { name: "Hotels" }, { name: "Restaurants" }, { name: "Lounges & Bars" }, { name: "Apartments" },
                  { name: "Hospitals" }, { name: "Markets" }, { name: "Banks" }, { name: "Schools" }, { name: "Businesses" },
                  { name: "Police Stations" }, { name: "Military Bases" }, { name: "Pharmacies" }, { name: "Fuel Stations" }
                ]).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Price Range</label>
              <select value={form.price_range} onChange={e => set("price_range", e.target.value)}
                className="w-full h-9 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select price range</option>
                {PRICE_RANGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Address</label>
              <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street address, Warri" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Phone</label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Email</label>
              <Input value={form.email} onChange={e => set("email", e.target.value)} type="email" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Website</label>
              <Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Latitude</label>
              <Input value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="5.5167" type="number" step="any" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Longitude</label>
              <Input value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="5.7500" type="number" step="any" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Opening Hours</label>
              <Input value={form.opening_hours} onChange={e => set("opening_hours", e.target.value)} placeholder="Mon-Fri 8am-10pm, Sat-Sun 10am-8pm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Photo URL</label>
              <Input value={form.photo_url} onChange={e => set("photo_url", e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Brief description..."
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Tags (comma-separated)</label>
              <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="wifi, parking, air conditioning" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="w-full h-9 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => set("is_featured", e.target.checked)} className="accent-primary" />
              <label htmlFor="featured" className="text-sm text-foreground font-sans">Featured listing</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : listing ? "Save Changes" : "Add Listing"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}