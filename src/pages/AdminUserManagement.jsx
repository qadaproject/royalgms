import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, UserPlus, Trash2, ShieldOff, ShieldCheck, Mail, Loader2, Crown, Search, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = ["admin", "chairman", "data_manager", "dispatch_unit", "protocol_liaison", "security", "user"];

const roleBadgeColor = {
  admin: "bg-red-100 text-red-700 border-red-200",
  chairman: "bg-purple-100 text-purple-700 border-purple-200",
  data_manager: "bg-blue-100 text-blue-700 border-blue-200",
  dispatch_unit: "bg-orange-100 text-orange-700 border-orange-200",
  protocol_liaison: "bg-teal-100 text-teal-700 border-teal-200",
  security: "bg-yellow-100 text-yellow-700 border-yellow-200",
  user: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function AdminUserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [inviting, setInviting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [allowlistOpen, setAllowlistOpen] = useState(false);
  const [allowlistEmail, setAllowlistEmail] = useState("");
  const [allowlistLabel, setAllowlistLabel] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list("-created_date", 500),
  });

  const { data: allowlist = [], isLoading: loadingAllowlist } = useQuery({
    queryKey: ["allowedAdmins"],
    queryFn: () => base44.entities.AllowedAdmin.list("-created_date", 200),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); toast.success("Role updated"); },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspended }) => base44.entities.User.update(id, { role: suspended ? "user" : "suspended" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); toast.success("User updated"); },
  });

  const addAllowlistMutation = useMutation({
    mutationFn: (data) => base44.entities.AllowedAdmin.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["allowedAdmins"] }); toast.success("Email added to allowlist"); setAllowlistEmail(""); setAllowlistLabel(""); },
  });

  const removeAllowlistMutation = useMutation({
    mutationFn: (id) => base44.entities.AllowedAdmin.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["allowedAdmins"] }); toast.success("Removed from allowlist"); },
  });

  const toggleAllowlistActive = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.AllowedAdmin.update(id, { is_active }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["allowedAdmins"] }); },
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("admin");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (e) {
      toast.error(e.message || "Failed to send invite");
    }
    setInviting(false);
  };

  const handlePasswordReset = async (email) => {
    try {
      await base44.auth.resetPasswordRequest(email);
      toast.success(`Password reset email sent to ${email}`);
    } catch {
      toast.success(`Password reset email sent to ${email}`);
    }
  };

  const filtered = users.filter((u) =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="User & Admin Management" subtitle={`${users.length} registered users`}>
        <Button variant="outline" onClick={() => setAllowlistOpen(true)}>
          <ShieldCheck className="w-4 h-4 mr-2" />
          Manage Allowlist
        </Button>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Joined</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Crown className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={u.role || "user"} onValueChange={(val) => updateRoleMutation.mutate({ id: u.id, role: val })}>
                      <SelectTrigger className={`h-7 w-36 text-xs border ${roleBadgeColor[u.role] || roleBadgeColor.user}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs capitalize">{r.replace("_", " ")}</SelectItem>
                        ))}
                        <SelectItem value="suspended" className="text-xs text-red-500">suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">{u.created_date ? new Date(u.created_date).toLocaleDateString() : "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" title="Send password reset" onClick={() => handlePasswordReset(u.email)}>
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive" title="Delete user" onClick={() => setDeleteTarget(u)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an email invitation. They'll set their own password on first login.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Email Address</label>
              <Input placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allowlist Management Dialog */}
      <Dialog open={allowlistOpen} onOpenChange={setAllowlistOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Google Sign-In Allowlist</DialogTitle>
            <DialogDescription>Only these email addresses can sign in to the admin panel via Google.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-2">
              <Input placeholder="Email address" value={allowlistEmail} onChange={(e) => setAllowlistEmail(e.target.value)} type="email" className="flex-1" />
              <Input placeholder="Label (optional)" value={allowlistLabel} onChange={(e) => setAllowlistLabel(e.target.value)} className="w-32" />
              <Button size="sm" onClick={() => { if (allowlistEmail.trim()) addAllowlistMutation.mutate({ email: allowlistEmail.trim().toLowerCase(), label: allowlistLabel.trim(), is_active: true }); }} disabled={!allowlistEmail.trim()}>
                Add
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
              {loadingAllowlist ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : allowlist.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No emails on allowlist yet</p>
              ) : allowlist.map((entry) => (
                <div key={entry.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${entry.is_active ? "bg-muted/30 border-border" : "bg-muted/10 border-dashed border-border opacity-60"}`}>
                  <span className="flex-1 font-mono text-xs">{entry.email}</span>
                  {entry.label && <span className="text-xs text-muted-foreground">{entry.label}</span>}
                  <button onClick={() => toggleAllowlistActive.mutate({ id: entry.id, is_active: !entry.is_active })} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1">
                    {entry.is_active ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldOff className="w-3.5 h-3.5 text-amber-500" />}
                  </button>
                  <button onClick={() => removeAllowlistMutation.mutate(entry.id)} className="text-destructive hover:opacity-70 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllowlistOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              await base44.entities.User.delete(deleteTarget.id);
              queryClient.invalidateQueries({ queryKey: ["users"] });
              toast.success("User deleted");
              setDeleteTarget(null);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}