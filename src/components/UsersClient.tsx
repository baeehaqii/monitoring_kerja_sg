"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, User, Pencil, Trash2, FolderOpen } from "lucide-react";

type UserItem = {
  id: string; name: string; email: string; role: string;
  divisionId: string | null; whatsappNumber: string | null; createdAt: string;
  division: { name: string } | null;
  userProjects: { projectId: string; project: { id: string; name: string; cluster: string } }[];
};
type Division = { id: string; name: string };
type Project = { id: string; name: string; cluster: string; clusterType: string };

interface Props {
  users: UserItem[];
  divisions: Division[];
  projects: Project[];
  isSuperAdmin: boolean;
}

const ROLES = [
  { value: "MEMBER", label: "Member" },
  { value: "GENERAL_MANAGER", label: "General Manager" },
  { value: "DIREKTUR_BISNIS", label: "Direktur Bisnis" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const ROLE_BADGE: Record<string, { label: string; variant: "default" | "info" | "warning" | "danger" | "success" | "secondary" }> = {
  MEMBER: { label: "Member", variant: "default" },
  GENERAL_MANAGER: { label: "General Manager", variant: "success" },
  DIREKTUR_BISNIS: { label: "Dir. Bisnis", variant: "info" },
  ADMIN: { label: "Admin", variant: "warning" },
  SUPER_ADMIN: { label: "Super Admin", variant: "danger" },
};

const CLUSTER_COLOR: Record<string, string> = {
  GRAHA: "bg-blue-50 text-blue-600",
  GRIYA: "bg-green-50 text-green-600",
  SGM: "bg-purple-50 text-purple-600",
};

export function UsersClient({ users, divisions, projects, isSuperAdmin }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [projectUser, setProjectUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "MEMBER",
    divisionId: "", whatsappNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingProject, setSavingProject] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  async function handleBulkDelete() {
    if (!confirm(`Hapus ${selected.size} pengguna yang dipilih?`)) return;
    setBulkDeleting(true);
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    setBulkDeleting(false);
    setSelected(new Set());
    router.refresh();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  }

  async function toggleProjectAccess(projectId: string, hasAccess: boolean) {
    if (!projectUser) return;
    setSavingProject(projectId);
    await fetch(`/api/projects/${projectId}/users`, {
      method: hasAccess ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: projectUser.id }),
    });
    setSavingProject(null);
    router.refresh();
    // Update local state optimistically so modal reflects change without closing
    setProjectUser((prev) => {
      if (!prev) return prev;
      if (hasAccess) {
        return { ...prev, userProjects: prev.userProjects.filter((up) => up.projectId !== projectId) };
      } else {
        const proj = projects.find((p) => p.id === projectId);
        if (!proj) return prev;
        return {
          ...prev,
          userProjects: [...prev.userProjects, { projectId, project: { id: proj.id, name: proj.name, cluster: proj.cluster } }],
        };
      }
    });
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

  // Group projects by clusterType for the access modal
  const projectsByType = projects.reduce<Record<string, Project[]>>((acc, p) => {
    if (!acc[p.clusterType]) acc[p.clusterType] = [];
    acc[p.clusterType].push(p);
    return acc;
  }, {});

  const allSelected = users.length > 0 && selected.size === users.length;
  const someSelected = selected.size > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {isSuperAdmin && someSelected ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{selected.size} dipilih</span>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              loading={bulkDeleting}
              onClick={handleBulkDelete}
            >
              Hapus {selected.size} Pengguna
            </Button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Batal
            </button>
          </div>
        ) : (
          <div />
        )}
        <Button onClick={() => { resetForm(); setAddOpen(true); }} icon={<Plus className="w-4 h-4" />}>
          Tambah Pengguna
        </Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {isSuperAdmin && (
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-[#0f52ba]"
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyek</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={isSuperAdmin ? 7 : 6} className="text-center text-slate-400 py-8">Belum ada pengguna</td></tr>
              ) : (
                users.map((u) => {
                  const rb = ROLE_BADGE[u.role] ?? { label: u.role, variant: "default" as const };
                  const isSelected = selected.has(u.id);
                  return (
                    <tr key={u.id} className={`border-b border-slate-50 transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(u.id)}
                            className="w-4 h-4 rounded accent-[#0f52ba]"
                          />
                        </td>
                      )}
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
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setProjectUser(u)}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0f52ba] transition-colors"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{u.userProjects.length} proyek</span>
                        </button>
                      </td>
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

      {/* Add user modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Pengguna" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormContent />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* Edit user modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit Pengguna" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <FormContent />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditUser(null)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* Project access modal */}
      <Modal
        open={!!projectUser}
        onClose={() => setProjectUser(null)}
        title={`Akses Proyek — ${projectUser?.name ?? ""}`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Centang proyek yang dapat diakses pengguna ini.</p>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Belum ada proyek. Tambah proyek di menu Pengaturan.</p>
          ) : (
            Object.entries(projectsByType).map(([type, typeProjects]) => (
              <div key={type}>
                <p className={`text-[11px] font-bold px-2 py-1 rounded-md inline-block mb-2 ${CLUSTER_COLOR[type] ?? "bg-slate-100 text-slate-600"}`}>
                  {type}
                </p>
                <div className="space-y-1.5">
                  {typeProjects.map((proj) => {
                    const hasAccess = !!projectUser?.userProjects.find((up) => up.projectId === proj.id);
                    const isLoading = savingProject === proj.id;
                    return (
                      <label
                        key={proj.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          disabled={isLoading}
                          onChange={() => toggleProjectAccess(proj.id, hasAccess)}
                          className="w-4 h-4 rounded accent-[#0f52ba]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{proj.name}</p>
                          <p className="text-xs text-slate-400">{proj.cluster}</p>
                        </div>
                        {isLoading && <span className="text-xs text-slate-400">Menyimpan...</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setProjectUser(null)}>Tutup</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
