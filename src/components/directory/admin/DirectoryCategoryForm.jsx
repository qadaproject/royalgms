import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DirectoryCategoryForm({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || "",
    icon: category?.icon || "",
    slug: category?.slug || "",
    color: category?.color || "",
    sort_order: category?.sort_order ?? 0,
    is_active: category?.is_active ?? true,
    google_types: category?.google_types?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form,
      sort_order: parseInt(form.sort_order) || 0,
      google_types: form.google_types ? form.google_types.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    if (category?.id) {
      await base44.entities.DirectoryCategory.update(category.id, data);
    } else {
      await base44.entities.DirectoryCategory.create(data);
    }
    setLoading(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg font-semibold">{category ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-sans mb-1 block">Name *</label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="e.g. Hotels" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Icon (emoji)</label>
              <Input value={form.icon} onChange={e => set("icon", e.target.value)} placeholder="🏨" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Slug *</label>
              <Input value={form.slug} onChange={e => set("slug", e.target.value)} required placeholder="hotels" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-sans mb-1 block">Google Places Types (comma-separated)</label>
            <Input value={form.google_types} onChange={e => set("google_types", e.target.value)} placeholder="lodging, hotel" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-sans mb-1 block">Sort Order</label>
              <Input value={form.sort_order} onChange={e => set("sort_order", e.target.value)} type="number" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="catActive" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="accent-primary" />
              <label htmlFor="catActive" className="text-sm font-sans">Active</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : category ? "Save" : "Add"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}