"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { plans } from "@/data/plans";
import type { PlanId } from "@/types";

// No password_hash/image here — this is passed straight into a client
// component prop, which Next.js serializes into the page payload, so
// anything sensitive on the real MockUser type has to stay server-side.
export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  plan: PlanId | null;
  purchasedEventCount: number;
  orderCount: number;
  isAdmin: boolean;
}

const NO_PLAN_VALUE = "none";

type FormState = { name: string; email: string; password: string; plan: string; isAdmin: boolean };

const EMPTY_FORM: FormState = { name: "", email: "", password: "", plan: NO_PLAN_VALUE, isAdmin: false };

export function UserManager({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminUserRow | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditing("new");
  }

  function openEdit(user: AdminUserRow) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      plan: user.plan ?? NO_PLAN_VALUE,
      isAdmin: user.isAdmin,
    });
    setEditing(user);
  }

  async function submit() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        plan: form.plan === NO_PLAN_VALUE ? null : form.plan,
        isAdmin: form.isAdmin,
      };

      const res =
        editing === "new"
          ? await fetch("/api/admin/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, password: form.password }),
            })
          : await fetch(`/api/admin/users/${editing.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong saving that account.");
        return;
      }

      toast.success(editing === "new" ? "Account created." : "Account updated.");
      setEditing(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong saving that account.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(user: AdminUserRow) {
    if (user.id === currentUserId) return;
    if (!window.confirm(`Permanently delete ${user.email}? This can't be undone.`)) return;

    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Something went wrong deleting that account.");
        return;
      }
      toast.success("Account deleted.");
      router.refresh();
    } catch {
      toast.error("Something went wrong deleting that account.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white">Users</h2>
        <Button size="sm" onClick={openAdd} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-wwc-grey-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-wwc-grey-900 text-xs uppercase tracking-wide text-wwc-grey-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Purchases</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wwc-grey-800 bg-wwc-grey-950">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-white">{user.name}</td>
                <td className="px-4 py-3 text-wwc-grey-400">{user.email}</td>
                <td className="px-4 py-3 uppercase text-wwc-grey-300">{user.plan ?? "No Plan"}</td>
                <td className="px-4 py-3 text-wwc-grey-400">{user.purchasedEventCount}</td>
                <td className="px-4 py-3 text-wwc-grey-400">{user.orderCount}</td>
                <td className="px-4 py-3">
                  {user.isAdmin && <Badge variant="subscribers">Admin</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      aria-label={`Edit ${user.email}`}
                      className="text-wwc-grey-400 transition-colors hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(user)}
                      disabled={user.id === currentUserId || deletingId === user.id}
                      aria-label={`Delete ${user.email}`}
                      title={user.id === currentUserId ? "You can't delete your own account" : undefined}
                      className="text-wwc-grey-400 transition-colors hover:text-wwc-red disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-wwc-grey-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add User" : "Edit User"}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {editing === "new" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-password">Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-plan">Plan</Label>
              <Select value={form.plan} onValueChange={(value) => setForm({ ...form, plan: value })}>
                <SelectTrigger id="user-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PLAN_VALUE}>No Plan</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm text-wwc-grey-300">
              <input
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
                className="h-4 w-4 rounded-sm border-wwc-grey-700 bg-wwc-grey-900 accent-wwc-red"
              />
              Admin access
            </label>

            <Button type="submit" disabled={saving} className="mt-2 w-full">
              {editing === "new" ? "Create Account" : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
