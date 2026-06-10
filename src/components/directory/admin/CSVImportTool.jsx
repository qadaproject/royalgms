import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Download, CheckCircle2, XCircle, Loader2, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CSV_COLUMNS = [
  "name", "category", "description", "address", "city", "state",
  "phone", "email", "website", "price_range", "opening_hours",
  "latitude", "longitude", "rating", "photo_url", "tags", "is_featured"
];

const SAMPLE_ROWS = [
  {
    name: "Warri Grand Hotel",
    category: "Hotel",
    description: "A premium hotel in the heart of Warri with top-class amenities.",
    address: "12 Okumagba Avenue, Warri",
    city: "Warri",
    state: "Delta State",
    phone: "08012345678",
    email: "info@warrigrand.com",
    website: "https://warrigrand.com",
    price_range: "₦₦₦",
    opening_hours: "Mon-Sun 24hrs",
    latitude: "5.5167",
    longitude: "5.7500",
    rating: "4.3",
    photo_url: "",
    tags: "hotel,accommodation,luxury",
    is_featured: "false",
  },
  {
    name: "Chicken Republic Warri",
    category: "Restaurant",
    description: "Popular fast food chain serving Nigerian favourites.",
    address: "Effurun Roundabout, Warri",
    city: "Warri",
    state: "Delta State",
    phone: "07098765432",
    email: "",
    website: "",
    price_range: "₦₦",
    opening_hours: "Mon-Sun 9am-10pm",
    latitude: "5.5340",
    longitude: "5.7310",
    rating: "4.0",
    photo_url: "",
    tags: "restaurant,fast food,chicken",
    is_featured: "false",
  },
];

function toCSV(rows) {
  const header = CSV_COLUMNS.join(",");
  const body = rows.map(r =>
    CSV_COLUMNS.map(col => {
      const v = r[col] ?? "";
      return String(v).includes(",") ? `"${v}"` : v;
    }).join(",")
  ).join("\n");
  return `${header}\n${body}`;
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { vals.push(cur); cur = ""; }
      else { cur += ch; }
    }
    vals.push(cur);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i]?.trim() ?? ""; });
    return obj;
  });
}

export default function CSVImportTool({ onImported }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    const csv = toCSV(SAMPLE_ROWS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "warri_directory_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      const errs = [];
      rows.forEach((r, i) => {
        if (!r.name?.trim()) errs.push(`Row ${i + 2}: Missing required field "name"`);
        if (!r.category?.trim()) errs.push(`Row ${i + 2}: Missing required field "category"`);
      });
      setErrors(errs);
      setPreview(rows);
      setResults(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0 || errors.length > 0) return;
    setImporting(true);
    let imported = 0;
    let failed = 0;
    const failedRows = [];

    for (const row of preview) {
      if (!row.name?.trim()) { failed++; continue; }
      const record = {
        name: row.name.trim(),
        category: row.category?.trim() || "General",
        description: row.description?.trim() || null,
        address: row.address?.trim() || null,
        city: row.city?.trim() || "Warri",
        state: row.state?.trim() || "Delta State",
        phone: row.phone?.trim() || null,
        email: row.email?.trim() || null,
        website: row.website?.trim() || null,
        price_range: row.price_range?.trim() || null,
        opening_hours: row.opening_hours?.trim() || null,
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
        rating: row.rating ? parseFloat(row.rating) : 0,
        photo_url: row.photo_url?.trim() || null,
        tags: row.tags ? row.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        is_featured: row.is_featured?.toLowerCase() === "true",
        status: "active",
        source: "manual",
      };
      try {
        await base44.entities.DirectoryListing.create(record);
        imported++;
      } catch {
        failed++;
        failedRows.push(row.name);
      }
    }

    setResults({ imported, failed, failedRows });
    setImporting(false);
    setPreview(null);
    if (imported > 0) onImported();
  };

  const reset = () => {
    setPreview(null);
    setErrors([]);
    setResults(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Template download */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-base font-semibold mb-1">CSV Bulk Import</h3>
            <p className="text-muted-foreground text-xs font-sans mb-3">
              Upload a CSV file to add multiple business listings at once. Download the template below to get started with the correct format.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground mb-3 overflow-x-auto">
              <span className="text-foreground font-semibold">Required columns: </span>name, category
              <br />
              <span className="text-foreground font-semibold">Optional columns: </span>description, address, city, state, phone, email, website, price_range (₦/₦₦/₦₦₦/₦₦₦₦), opening_hours, latitude, longitude, rating, photo_url, tags (comma-separated), is_featured (true/false)
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <Download className="w-4 h-4" />
              Download CSV Template
            </Button>
          </div>
          <FileText className="w-10 h-10 text-primary/30 shrink-0" />
        </div>
      </div>

      {/* Upload area */}
      {!results && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading text-sm font-semibold mb-3">Upload Your CSV</h3>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-10 cursor-pointer transition-colors group">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to browse or drag & drop your CSV</p>
            <p className="text-xs text-muted-foreground mt-1">Supports .csv files only</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </label>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">Validation errors — fix your CSV before importing</p>
              </div>
              <ul className="text-xs text-destructive space-y-1">
                {errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview && errors.length === 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">{preview.length} rows ready to import</p>
                <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              </div>
              <div className="overflow-x-auto border border-border rounded-lg max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {["Name", "Category", "Address", "Phone", "Price", "Rating"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((r, i) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{r.name || "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.category || "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground max-w-[180px] truncate">{r.address || "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.phone || "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.price_range || "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.rating || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleImport} disabled={importing} className="gap-2">
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {importing ? "Importing..." : `Import ${preview.length} Listings`}
                </Button>
                <Button variant="outline" onClick={reset} disabled={importing}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className={`bg-card border rounded-xl p-6 ${results.failed === 0 ? "border-emerald-200" : "border-amber-200"}`}>
          <div className="flex items-center gap-3 mb-4">
            {results.failed === 0
              ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              : <AlertTriangle className="w-6 h-6 text-amber-500" />
            }
            <h3 className="font-heading text-base font-semibold">Import Complete</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{results.imported}</p>
              <p className="text-xs text-emerald-700 mt-0.5">Successfully Imported</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${results.failed > 0 ? "bg-red-50" : "bg-muted/50"}`}>
              <p className={`text-2xl font-bold ${results.failed > 0 ? "text-red-500" : "text-muted-foreground"}`}>{results.failed}</p>
              <p className={`text-xs mt-0.5 ${results.failed > 0 ? "text-red-600" : "text-muted-foreground"}`}>Failed</p>
            </div>
          </div>
          {results.failedRows.length > 0 && (
            <p className="text-xs text-muted-foreground mb-4">Failed: {results.failedRows.join(", ")}</p>
          )}
          <Button onClick={reset} variant="outline" size="sm">Import Another File</Button>
        </div>
      )}
    </div>
  );
}