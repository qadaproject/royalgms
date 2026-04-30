import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const allCategories = ["A - Royal", "B - Federal", "C - State", "D - Corporate", "E - Diplomatic", "F - Traditional", "G - General"];

export default function ZoneFormDialog({ open, onOpenChange, zone, onSave }) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [description, setDescription] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [categoriesAllowed, setCategoriesAllowed] = useState([]);

  useEffect(() => {
    if (zone) {
      setName(zone.name || "");
      setCapacity(zone.capacity || 50);
      setDescription(zone.description || "");
      setSpecialNotes(zone.special_notes || "");
      setCategoriesAllowed(zone.categories_allowed || []);
    } else {
      setName("");
      setCapacity(50);
      setDescription("");
      setSpecialNotes("");
      setCategoriesAllowed([]);
    }
  }, [zone]);

  const toggleCategory = (cat) => {
    setCategoriesAllowed((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    onSave({ name, capacity, description, special_notes: specialNotes, categories_allowed: categoriesAllowed });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{zone ? "Edit Zone" : "Create Zone"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Zone Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Inner Circle, Royal Pavilion" />
          </div>
          <div>
            <Label className="text-xs">Capacity *</Label>
            <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Zone location and details..." />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Allowed Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-xs cursor-pointer py-1">
                  <Checkbox
                    checked={categoriesAllowed.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Security / Protocol Notes</Label>
            <Textarea value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} placeholder="Special security requirements..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name || !capacity}>{zone ? "Update" : "Create"} Zone</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}