import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Store } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import useMpUser from "@/hooks/useMpUser";
import { toast } from "sonner";

export default function VendorRegisterPage() {
  const { user: mpUser } = useMpUser();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    owner_full_name: "",
    category_id: "",
    category_name: "",
    description: "",
    email: "",
    phone: "",
    location_city: "",
    location_state: "",
    price_range: "",
  });

  // Pre-populate from logged-in user
  useEffect(() => {
    if (mpUser) {
      setForm(f => ({
        ...f,
        owner_full_name: mpUser.full_name || "",
        email: mpUser.email || "",
      }));
    }
  }, [mpUser?.id]);

  const { data: categories = [] } = useQuery({
    queryKey: ["marketplace_categories"],
    queryFn: () => base44.entities.MarketplaceCategory.filter({ is_active: true }, "sort_order", 50),
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.business_name || !form.owner_full_name || !form.email || !form.phone || !form.category_id) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Vendor.create({
        ...form,
        approval_status: "Approved",
        email_verified: true,
        is_verified: false,
        ...(mpUser?.id ? { user_id: mpUser.id } : {}),
      });
      toast.success("Business registered! You can now add your products and services.");
      navigate("/marketplace/vendor-dashboard");
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (!mpUser) return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Store className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
        <h2 className="font-heading text-2xl font-semibold mb-2">Sign in to Register</h2>
        <p className="text-muted-foreground text-sm mb-6">You need a marketplace account to list your business.</p>
        <Button asChild><Link to="/marketplace/login">Sign In / Register</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceNav />
      <div className="max-w-xl mx-auto px-4 py-10">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-semibold mb-1">List Your Business</h1>
          <p className="text-muted-foreground text-sm">Fill in your business details to get started immediately.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Business Name <span className="text-red-500">*</span></Label>
              <Input value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="e.g. Warri Grand Hotel" />
            </div>
            <div className="space-y-1.5">
              <Label>Owner Name <span className="text-red-500">*</span></Label>
              <Input value={form.owner_full_name} onChange={e => set("owner_full_name", e.target.value)} placeholder="Full legal name" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category <span className="text-red-500">*</span></Label>
            <Select value={form.category_id} onValueChange={v => {
              const cat = categories.find(c => c.id === v);
              setForm(f => ({ ...f, category_id: v, category_name: cat?.name || "" }));
            }}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe your business..." className="h-24" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="business@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone <span className="text-red-500">*</span></Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+234 xxx xxx xxxx" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.location_city} onChange={e => set("location_city", e.target.value)} placeholder="e.g. Warri" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.location_state} onChange={e => set("location_state", e.target.value)} placeholder="e.g. Delta State" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Price Range</Label>
            <Select value={form.price_range} onValueChange={v => set("price_range", v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Budget">Budget</SelectItem>
                <SelectItem value="Mid-range">Mid-range</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full mt-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registering...</> : "Register Business & Get Started"}
          </Button>
        </div>
      </div>
    </div>
  );
}