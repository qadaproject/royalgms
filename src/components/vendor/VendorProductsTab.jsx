import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package, CheckCircle, Clock, ImageOff } from "lucide-react";

export default function VendorProductsTab({ products, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = useState("all");

  const live = products.filter(p => p.is_approved);
  const pending = products.filter(p => !p.is_approved);

  const filtered = filter === "live" ? live : filter === "pending" ? pending : products;

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            All <span className="ml-1 opacity-70">{products.length}</span>
          </button>
          <button
            onClick={() => setFilter("live")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${filter === "live" ? "bg-emerald-600 text-white border-emerald-600" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
          >
            <CheckCircle className="w-3 h-3" /> Live <span className="ml-0.5 opacity-70">{live.length}</span>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${filter === "pending" ? "bg-amber-500 text-white border-amber-500" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
          >
            <Clock className="w-3 h-3" /> Pending <span className="ml-0.5 opacity-70">{pending.length}</span>
          </button>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Listing
        </Button>
      </div>

      {pending.length > 0 && filter !== "live" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800 flex items-start gap-2">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <span><strong>{pending.length} listing{pending.length > 1 ? "s" : ""} awaiting admin approval.</strong> They are not yet visible to the public. You'll be notified once approved.</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{filter === "pending" ? "No listings pending approval." : filter === "live" ? "No live listings yet." : "No listings yet. Add your first product or service."}</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <span className="w-12">Image</span>
            <span>Product / Service</span>
            <span className="text-right w-28">Price</span>
            <span className="text-center w-28">Status</span>
            <span className="w-16"></span>
          </div>

          <div className="divide-y divide-border">
            {filtered.map(p => (
              <div key={p.id} className="flex sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors flex-wrap sm:flex-nowrap">
                {/* Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center border border-border">
                  {p.image_urls?.[0]
                    ? <img src={p.image_urls[0]} alt={p.name} className="w-full h-full object-cover" />
                    : <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                  }
                </div>

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  {p.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{p.description}</p>}
                  {p.unit && <p className="text-[10px] text-muted-foreground mt-0.5">per {p.unit}</p>}
                </div>

                {/* Price */}
                <div className="text-right w-28 shrink-0">
                  {p.discount_percent > 0 ? (
                    <div>
                      <p className="font-bold text-sm text-primary">₦{(p.discounted_price || p.price * (1 - p.discount_percent / 100)).toLocaleString()}</p>
                      <p className="text-[10px] line-through text-muted-foreground">₦{p.price?.toLocaleString()}</p>
                    </div>
                  ) : (
                    <p className="font-bold text-sm text-primary">₦{p.price?.toLocaleString()}</p>
                  )}
                </div>

                {/* Status */}
                <div className="w-28 flex justify-center shrink-0">
                  {p.is_approved ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 gap-1">
                      <CheckCircle className="w-3 h-3" /> Live
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50 gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 w-16 justify-end shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(p)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}