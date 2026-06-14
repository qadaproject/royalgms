import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Heart, MessageSquare, Settings, Upload, Loader2, LogOut, Star } from "lucide-react";
import MarketplaceNav from "../components/marketplace/MarketplaceNav";
import useMpUser, { logoutMpUser } from "@/hooks/useMpUser";
import { hashPassword, setMpSession } from "@/lib/marketplaceAuth";
import { setGlobalMpUser } from "@/hooks/useMpUser";
import StarRating from "../components/marketplace/StarRating";
import { toast } from "sonner";

export default function MarketplaceUserDashboard() {
  const { user, refresh } = useMpUser();
  const [settingsForm, setSettingsForm] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  useEffect(() => {
    if (user) setSettingsForm({ full_name: user.full_name || "", username: user.username || "", bio: user.bio || "" });
  }, [user?.id]);

  const { data: comments = [] } = useQuery({
    queryKey: ["my_comments", user?.id],
    queryFn: () => base44.entities.VendorComment.filter({ user_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: favVendors = [] } = useQuery({
    queryKey: ["fav_vendors", user?.id],
    queryFn: async () => {
      if (!user?.favorites_vendor_ids?.length) return [];
      const all = await base44.entities.Vendor.filter({ approval_status: "Approved" });
      return all.filter(v => user.favorites_vendor_ids.includes(v.id));
    },
    enabled: !!user?.id,
  });

  if (!user) return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="font-heading text-2xl font-semibold mb-3">Sign In Required</h2>
        <p className="text-muted-foreground mb-6">Please sign in to access your dashboard.</p>
        <Button asChild><Link to="/marketplace/login">Sign In</Link></Button>
      </div>
    </div>
  );

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      if (settingsForm.username) {
        const existing = await base44.entities.MarketplaceUser.filter({ username: settingsForm.username });
        if (existing.length && existing[0].id !== user.id) { toast.error("Username already taken"); setSavingSettings(false); return; }
      }
      await base44.entities.MarketplaceUser.update(user.id, settingsForm);
      await refresh();
      toast.success("Settings saved!");
    } catch { toast.error("Failed to save"); } finally { setSavingSettings(false); }
  };

  const changePassword = async () => {
    if (!newPass || newPass.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPass !== confirmPass) { toast.error("Passwords don't match"); return; }
    const hash = await hashPassword(newPass);
    await base44.entities.MarketplaceUser.update(user.id, { password_hash: hash });
    setNewPass(""); setConfirmPass("");
    toast.success("Password updated!");
  };

  const uploadPhoto = async (file) => {
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.MarketplaceUser.update(user.id, { photo_url: file_url });
    await refresh();
    setUploadingPhoto(false);
    toast.success("Photo updated!");
  };

  const unfavoriteVendor = async (vendorId) => {
    const newIds = (user.favorites_vendor_ids || []).filter(id => id !== vendorId);
    await base44.entities.MarketplaceUser.update(user.id, { favorites_vendor_ids: newIds });
    await refresh();
  };

  return (
    <div className="min-h-screen bg-background"><MarketplaceNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            {user.photo_url
              ? <img src={user.photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              : <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{user.full_name?.[0]}</div>
            }
            <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-primary/90">
              {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadPhoto(e.target.files[0])} />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-semibold">{user.full_name}</h1>
            {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { logoutMpUser(); window.location.href = "/marketplace"; }}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Comments", value: comments.length, icon: <MessageSquare className="w-5 h-5 text-primary" /> },
            { label: "Favourites", value: favVendors.length, icon: <Heart className="w-5 h-5 text-red-400" /> },
            { label: "Member Since", value: new Date(user.created_date).getFullYear(), icon: <Star className="w-5 h-5 text-amber-400" /> },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-heading text-xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="comments">
          <TabsList className="mb-6">
            <TabsTrigger value="comments"><MessageSquare className="w-4 h-4 mr-1" />My Comments</TabsTrigger>
            <TabsTrigger value="favourites"><Heart className="w-4 h-4 mr-1" />Favourites</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="comments">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">You haven't left any comments yet.</p>
            ) : (
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/marketplace/vendor?id=${c.vendor_id}`} className="font-semibold text-sm text-primary hover:underline">{c.vendor_name}</Link>
                        {c.product_name && <Badge variant="outline" className="ml-2 text-[10px]">{c.product_name}</Badge>}
                        <p className="text-sm text-muted-foreground mt-1">{c.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">👍 {c.thumbs_up || 0} · 👎 {c.thumbs_down || 0}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{new Date(c.created_date).toLocaleDateString()}</span>
                    </div>
                    {c.vendor_reply && (
                      <div className="mt-3 pl-3 border-l-2 border-primary/20 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Vendor reply: </span>{c.vendor_reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favourites">
            {favVendors.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No favourites yet. Heart a vendor to save them here.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favVendors.map(v => (
                  <div key={v.id} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-center">
                    {v.logo_url
                      ? <img src={v.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
                      : <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">{v.category_name?.[0] || "🏪"}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <Link to={`/marketplace/vendor?id=${v.id}`} className="font-semibold text-sm hover:text-primary truncate block">{v.business_name}</Link>
                      <p className="text-xs text-muted-foreground">{v.category_name} · {v.location_city}</p>
                      <StarRating rating={v.average_rating || 0} size="xs" />
                    </div>
                    <button onClick={() => unfavoriteVendor(v.id)} className="text-red-400 hover:text-red-600 shrink-0" title="Remove favourite">
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-lg space-y-6">
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-heading text-base font-semibold">Profile</h3>
                <div className="space-y-1.5"><Label>Full Name</Label>
                  <Input value={settingsForm.full_name || ""} onChange={e => setSettingsForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Username</Label>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground text-sm">@</span>
                    <Input value={settingsForm.username || ""} onChange={e => setSettingsForm(f => ({ ...f, username: e.target.value.replace(/\s/g, "").toLowerCase() }))} placeholder="your_username" />
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Bio</Label>
                  <Textarea value={settingsForm.bio || ""} onChange={e => setSettingsForm(f => ({ ...f, bio: e.target.value }))} className="h-20" /></div>
                <Button onClick={saveSettings} disabled={savingSettings} size="sm">
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Changes
                </Button>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-heading text-base font-semibold">Change Password</h3>
                <div className="space-y-1.5"><Label>New Password</Label>
                  <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 6 characters" /></div>
                <div className="space-y-1.5"><Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} /></div>
                <Button onClick={changePassword} size="sm" variant="outline">Update Password</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}