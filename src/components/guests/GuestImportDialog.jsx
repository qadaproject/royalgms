import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, CheckCircle2, X, FileSpreadsheet, Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getTierForCategory } from "@/lib/guestTiers";

const COLUMNS = [
  "formal_salutation", "full_name", "official_title", "post_nominals", "category",
  "email", "phone", "contact_person_name", "contact_person_phone", "contact_person_email",
  "rsvp_status", "dietary_requirements", "medical_alerts", "security_detail_size",
  "arrival_details", "seating_zone", "special_requirements", "notes",
];

const COLUMN_LABELS = {
  formal_salutation: "Formal Salutation",
  full_name: "Full Name *",
  official_title: "Official Title",
  post_nominals: "Post Nominals",
  category: "Category *",
  email: "Email",
  phone: "Phone",
  contact_person_name: "Contact Person Name",
  contact_person_phone: "Contact Person Phone",
  contact_person_email: "Contact Person Email",
  rsvp_status: "RSVP Status",
  dietary_requirements: "Dietary Requirements",
  medical_alerts: "Medical Alerts",
  security_detail_size: "Security Detail Size",
  arrival_details: "Arrival Details",
  seating_zone: "Seating Zone",
  special_requirements: "Special Requirements",
  notes: "Notes",
};

const VALID_CATEGORIES = ["A - Royal", "B - Federal", "C - State", "D - Corporate", "E - Diplomatic", "F - Traditional", "G - General", "H - Socials", "I - Communities", "J - Chiefs"];
const VALID_RSVP = ["Pending", "Accepted", "Declined", "Proxy"];

function generateToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function downloadTemplate() {
  // Build CSV template with sample row
  const headers = COLUMNS.map((c) => COLUMN_LABELS[c]);
  const sample = [
    "His Excellency", "John Adeyemi Okafor", "Governor of Delta State", "CFR",
    "B - Federal", "john.okafor@example.com", "+234 801 234 5678",
    "Mr. Emeka Eze", "+234 801 111 2222", "emeka.eze@example.com",
    "Pending", "No pork", "", "2", "Flight: QR 402 arriving 10:00",
    "Inner Circle", "", "VIP guest — protocol escort required",
  ];

  const csvContent = [
    headers.join(","),
    sample.map((v) => `"${v}"`).join(","),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Guest_Import_Template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header row — match to our COLUMN_LABELS
  const headerRow = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  const labelToKey = {};
  Object.entries(COLUMN_LABELS).forEach(([key, label]) => {
    labelToKey[label.replace(" *", "").toLowerCase()] = key;
  });

  const colIndices = headerRow.map((h) => labelToKey[h.toLowerCase()] || null);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Handle quoted fields with commas
    const values = [];
    let inQuote = false, cur = "";
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { values.push(cur); cur = ""; }
      else { cur += ch; }
    }
    values.push(cur);

    const row = {};
    colIndices.forEach((key, idx) => {
      if (key) row[key] = (values[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function validateRow(row, index) {
  const errors = [];
  if (!row.full_name) errors.push("Full Name is required");
  if (!row.category) errors.push("Category is required");
  else if (!VALID_CATEGORIES.includes(row.category)) errors.push(`Invalid category: "${row.category}"`);
  if (row.rsvp_status && !VALID_RSVP.includes(row.rsvp_status)) errors.push(`Invalid RSVP status: "${row.rsvp_status}"`);
  return errors;
}

export default function GuestImportDialog({ open, onOpenChange, onImport, existingGuests = [] }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [duplicateIndices, setDuplicateIndices] = useState(new Set());
  const [duplicateDetails, setDuplicateDetails] = useState([]); // [{rowIndex, importedName, matchedName, matchField, matchValue}]
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setDone(false);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      const rowErrors = {};
      parsed.forEach((row, i) => {
        const errs = validateRow(row, i);
        if (errs.length) rowErrors[i] = errs;
      });

      // Duplicate check disabled — all valid rows import regardless of existing guests
      const dupSet = new Set();
      const dupDetails = [];

      setRows(parsed);
      setErrors(rowErrors);
      setDuplicateIndices(dupSet);
      setDuplicateDetails(dupDetails);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const validRows = rows.filter((_, i) => !errors[i] && !duplicateIndices.has(i));
  const invalidCount = Object.keys(errors).length;
  const duplicateCount = duplicateIndices.size;

  const handleImport = async () => {
    setImporting(true);
    setImportProgress(0);
    const prepared = validRows.map((row) => {
      const token = generateToken();
      return {
        ...row,
        tier: row.tier || getTierForCategory(row.category),
        rsvp_status: row.rsvp_status || "Pending",
        security_detail_size: parseInt(row.security_detail_size) || 0,
        protocol_validated: false,
        qr_code: token,
        rsvp_token: token,
      };
    });

    // Batch upload: 10 at a time, update progress after each batch
    const BATCH_SIZE = 10;
    let uploaded = 0;
    for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
      const batch = prepared.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((row) => base44.entities.Guest.create(row)));
      uploaded += batch.length;
      setImportProgress(Math.round((uploaded / prepared.length) * 100));
    }

    setImporting(false);
    setDone(true);
    setImportResult({ success: prepared.length, skipped: invalidCount, duplicates: duplicateCount });
  };

  const reset = () => {
    setRows([]);
    setErrors({});
    setDuplicateIndices(new Set());
    setDuplicateDetails([]);
    setShowDuplicates(false);
    setFileName("");
    setDone(false);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-accent" />
            Import Guests from Excel / CSV
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-10 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="font-heading text-xl font-semibold">Import Complete</h3>
            <p className="text-muted-foreground text-sm">
              <span className="text-emerald-600 font-semibold">{importResult?.success} guests</span> imported successfully.
              {importResult?.skipped > 0 && (
                <> &nbsp;<span className="text-amber-600 font-semibold">{importResult.skipped} rows</span> skipped due to errors.</>
              )}
              {importResult?.duplicates > 0 && (
                <> &nbsp;<span className="text-blue-600 font-semibold">{importResult.duplicates} duplicates</span> skipped.</>
              )}
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <Button onClick={reset} variant="outline">Import More</Button>
              <Button onClick={() => { reset(); onOpenChange(false); }}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {/* Template download */}
            <div className="flex items-center justify-between bg-muted/60 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Download Template</p>
                <p className="text-xs text-muted-foreground">CSV with all columns & a sample row</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-3.5 h-3.5 mr-2" />
                Template.csv
              </Button>
            </div>

            {/* Drop zone */}
            {!rows.length ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-sm">Click or drag & drop your CSV file here</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv files exported from Excel or Google Sheets</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* File info bar */}
                <div className="flex items-center justify-between bg-muted/60 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{fileName}</span>
                    <Badge variant="secondary">{rows.length} rows</Badge>
                  </div>
                  <button onClick={reset} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{validRows.length}</p>
                    <p className="text-xs text-emerald-600 font-medium">Ready to import</p>
                  </div>
                  <div className={`${invalidCount > 0 ? "bg-amber-50 border-amber-200" : "bg-muted/40 border-border"} border rounded-lg p-3 text-center`}>
                    <p className={`text-2xl font-bold ${invalidCount > 0 ? "text-amber-700" : "text-muted-foreground"}`}>{invalidCount}</p>
                    <p className={`text-xs font-medium ${invalidCount > 0 ? "text-amber-600" : "text-muted-foreground"}`}>Errors (skipped)</p>
                  </div>
                  <div className={`${duplicateCount > 0 ? "bg-blue-50 border-blue-200" : "bg-muted/40 border-border"} border rounded-lg p-3 text-center`}>
                    <p className={`text-2xl font-bold ${duplicateCount > 0 ? "text-blue-700" : "text-muted-foreground"}`}>{duplicateCount}</p>
                    <p className={`text-xs font-medium ${duplicateCount > 0 ? "text-blue-600" : "text-muted-foreground"}`}>Duplicates (skipped)</p>
                  </div>
                </div>

                {/* Errors list */}
                {invalidCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2 max-h-36 overflow-y-auto">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Rows with errors (will be skipped)</p>
                    {Object.entries(errors).map(([idx, errs]) => (
                      <div key={idx} className="text-xs text-amber-800">
                        <span className="font-semibold">Row {parseInt(idx) + 2}:</span> {errs.join(", ")}
                      </div>
                    ))}
                  </div>
                )}

                {/* Duplicates panel */}
                {duplicateCount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-100 transition-colors"
                      onClick={() => setShowDuplicates((v) => !v)}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                          {duplicateCount} Duplicate{duplicateCount !== 1 ? "s" : ""} Detected — will be skipped
                        </span>
                      </div>
                      {showDuplicates ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                    {showDuplicates && (
                      <div className="border-t border-blue-200 max-h-48 overflow-y-auto">
                        <table className="text-xs w-full">
                          <thead className="bg-blue-100/60">
                            <tr>
                              <th className="text-left px-3 py-1.5 font-semibold text-blue-800">Row</th>
                              <th className="text-left px-3 py-1.5 font-semibold text-blue-800">Imported Name</th>
                              <th className="text-left px-3 py-1.5 font-semibold text-blue-800">Matched Field</th>
                              <th className="text-left px-3 py-1.5 font-semibold text-blue-800">Value</th>
                              <th className="text-left px-3 py-1.5 font-semibold text-blue-800">Existing Guest</th>
                            </tr>
                          </thead>
                          <tbody>
                            {duplicateDetails.map((d, i) => (
                              <tr key={i} className="border-t border-blue-100">
                                <td className="px-3 py-1.5 text-blue-700">{d.rowIndex + 2}</td>
                                <td className="px-3 py-1.5 font-medium text-blue-900">{d.importedName || "—"}</td>
                                <td className="px-3 py-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${d.matchField === "Email" ? "bg-violet-100 text-violet-700" : "bg-cyan-100 text-cyan-700"}`}>
                                    {d.matchField}
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 text-blue-700 font-mono">{d.matchValue}</td>
                                <td className="px-3 py-1.5 text-blue-800">{d.matchedName || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview table */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Preview (first 5 valid rows)</p>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead className="bg-muted/60">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold">#</th>
                          <th className="text-left px-3 py-2 font-semibold">Name</th>
                          <th className="text-left px-3 py-2 font-semibold">Category</th>
                          <th className="text-left px-3 py-2 font-semibold">Title</th>
                          <th className="text-left px-3 py-2 font-semibold">RSVP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                            <td className="px-3 py-2 font-medium">{[row.formal_salutation, row.full_name].filter(Boolean).join(" ")}</td>
                            <td className="px-3 py-2">{row.category}</td>
                            <td className="px-3 py-2 text-muted-foreground truncate max-w-[140px]">{row.official_title || "—"}</td>
                            <td className="px-3 py-2">{row.rsvp_status || "Pending"}</td>
                          </tr>
                        ))}
                        {validRows.length > 5 && (
                          <tr className="border-t bg-muted/20">
                            <td colSpan={5} className="px-3 py-2 text-center text-muted-foreground">
                              + {validRows.length - 5} more rows...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Column reference */}
            <details className="border rounded-lg overflow-hidden">
              <summary className="px-4 py-2.5 text-xs font-semibold cursor-pointer bg-muted/40 hover:bg-muted/60 uppercase tracking-wider">
                Column Reference ({COLUMNS.length} columns)
              </summary>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {COLUMNS.map((col) => (
                  <div key={col} className="text-xs">
                    <span className={`font-medium ${col === "full_name" || col === "category" ? "text-primary" : "text-foreground"}`}>
                      {COLUMN_LABELS[col]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-3 text-[10px] text-muted-foreground">
                * Required fields. Category must be one of: {VALID_CATEGORIES.join(", ")}. RSVP Status: {VALID_RSVP.join(", ")}.
              </div>
            </details>

            {importing && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading guests in background…</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                </div>
              </div>
            )}

            {rows.length > 0 && (
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button variant="outline" onClick={reset}>Clear</Button>
                <Button
                  onClick={handleImport}
                  disabled={importing || validRows.length === 0}
                >
                  {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {importing ? `Uploading… ${importProgress}%` : `Import ${validRows.length} Guest${validRows.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}