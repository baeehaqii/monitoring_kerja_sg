"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, User, Pencil, Trash2 } from "lucide-react";

type UserItem = {
  id: string; name: string; email: string; role: string;
  divisionId: string | null; whatsappNumber: string | null; createdAt: string;
  division: { name: string } | null;
};
type Division = { id: string; name: string };

interface Props {
  users: UserItem[];
  divisions: Division[];
  isSuperAdmin: boolean;
}

const ROLES = [
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const ROLE_BADGE: Record<string, { label: string; variant: "default" | "info" | "warning" | "danger" | "success" | "secondary" }> = {
  MEMBER: { label: "Member", variant: "default" },
  ADMIN: { label: "Admin", variant: "info" },
  SUPER_ADMIN: { label: "Super Admin", variant: "warning" },
};

export function UsersClient({ users, divisions, isSuperAdmin }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "MEMBER",
    divisionId: "", whatsappNumber: "",
  });
  const [saving, setSaving] = useState(false);

  function openEdit(u: UserItem) {
    setEditUser(u);
    setForm({
      name: u.name, email: u.email, password: "",
      role: u.role, divisionId: u.divisionId ?? "",
      whatsappNumber: u.whatsappNumber ?? "",
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setAddOpen(false);
    resetForm();
    router.refresh();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    const body: Record<string, string> = { name: form.name, role: form.role, divisionId: form.divisionId, whatsappNumber: form.whatsappNumber };
    if (form.password) body.password = form.password;
    await fetch(`/api/users/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setEditUser(null);
    resetForm();
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus pengguna "${name}"?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function resetForm() {
    setForm({ name: "", email: "", password: "", role: "MEMBER", divisionId: "", whatsappNumber: "" });
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const FormContent = () => (
    <div className="space-y-4">
      <Input label="Nama" required value={form.name} onChange={f("name")} placeholder="Nama lengkap" />
      {!editUser && (
        <Input label="Email" type="email" required value={form.email} onChange={f("email")} placeholder="email@domain.com" />
      )}
      <Input
        label={editUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
        type="password"
        required={!editUser}
        value={form.password}
        onChange={f("password")}
        placeholder="••••••••"
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Role"
          value={form.role}
          onChange={f("role")}
          options={ROLES}
        />
        <Select
          label="Divisi"
          value={form.divisionId}
          onChange={f("divisionId")}
          options={divisions.map((d) => ({ value: d.id, label: d.name }))}
          placeholder="— Pilih Divisi —"
        />
      </div>
      <Input
        label="No. WhatsApp"
        value={form.whatsappNumber}
        onChange={f("whatsappNumber")}
        placeholder="08xxxxxxxxxx"
        hint="Untuk pengiriman reminder SLA"
      />
    </div>
  );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { resetForm(); setAddOpen(true); }} icon={<Plus className="w-4 h-4" />}>
          Tambah Pengguna
        </Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Belum ada pengguna</td></tr>
              ) : (
                users.map((u) => {
                  const rb = ROLE_BADGE[u.role] ?? { label: u.role, variant: "default" as const };
                  return (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#e8f0fe] flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-[#0f52ba]" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.division?.name ?? "—"}</td>
                      <td className="px-4 py-3"><Badge variant={rb.variant}>{rb.label}</Badge></td>
                      <td className="px-4 py-3 text-slate-600">{u.whatsappNumber ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0f52ba] hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Pengguna" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormContent />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit Pengguna" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <FormContent />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditUser(null)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
