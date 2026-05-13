"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { MENU_ITEMS } from "@/lib/constants";
import {
  Plus, Pencil, Trash2, Shield, ShieldCheck, Users,
  Eye, FilePlus, FileEdit, FileX, ChevronDown, ChevronUp,
} from "lucide-react";

type Permission = {
  id: string;
  menu: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
  _count: { users: number };
  createdAt: string;
};

type PermissionMap = Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }>;

function defaultPermissions(): PermissionMap {
  return Object.fromEntries(
    MENU_ITEMS.map((m) => [m.key, { canView: false, canCreate: false, canEdit: false, canDelete: false }])
  );
}

function rolesToPermMap(permissions: Permission[]): PermissionMap {
  const map = defaultPermissions();
  for (const p of permissions) {
    if (map[p.menu] !== undefined) {
      map[p.menu] = { canView: p.canView, canCreate: p.canCreate, canEdit: p.canEdit, canDelete: p.canDelete };
    }
  }
  return map;
}

function permMapToArray(map: PermissionMap) {
  return Object.entries(map).map(([menu, perms]) => ({ menu, ...perms }));
}

interface Props {
  roles: Role[];
}

export function RolesClient({ roles: initialRoles }: Props) {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", description: "" });
  const [permMap, setPermMap] = useState<PermissionMap>(defaultPermissions());

  function openCreate() {
    setEditRole(null);
    setForm({ name: "", description: "" });
    setPermMap(defaultPermissions());
    setError("");
    setShowModal(true);
  }

  function openEdit(role: Role) {
    setEditRole(role);
    setForm({ name: role.name, description: role.description ?? "" });
    setPermMap(rolesToPermMap(role.permissions));
    setError("");
    setShowModal(true);
  }

  function togglePerm(menu: string, field: "canView" | "canCreate" | "canEdit" | "canDelete") {
    setPermMap((prev) => ({
      ...prev,
      [menu]: { ...prev[menu], [field]: !prev[menu][field] },
    }));
  }

  function setAllForMenu(menu: string, value: boolean) {
    setPermMap((prev) => ({
      ...prev,
      [menu]: { canView: value, canCreate: value, canEdit: value, canDelete: value },
    }));
  }

  function setAllMenus(value: boolean) {
    const newMap: PermissionMap = {};
    for (const m of MENU_ITEMS) {
      newMap[m.key] = { canView: value, canCreate: value, canEdit: value, canDelete: value };
    }
    setPermMap(newMap);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Nama role wajib diisi"); return; }
    setLoading(true);
    setError("");
    try {
      const body = { name: form.name, description: form.description, permissions: permMapToArray(permMap) };
      const url = editRole ? `/api/roles/${editRole.id}` : "/api/roles";
      const method = editRole ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Terjadi kesalahan"); return; }
      if (editRole) {
        setRoles((prev) => prev.map((r) => (r.id === data.id ? data : r)));
      } else {
        setRoles((prev) => [...prev, data]);
      }
      setShowModal(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/roles/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? "Terjadi kesalahan"); return; }
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const permCols: { key: "canView" | "canCreate" | "canEdit" | "canDelete"; label: string; icon: React.ReactNode }[] = [
    { key: "canView", label: "Lihat", icon: <Eye className="size-3.5" /> },
    { key: "canCreate", label: "Tambah", icon: <FilePlus className="size-3.5" /> },
    { key: "canEdit", label: "Edit", icon: <FileEdit className="size-3.5" /> },
    { key: "canDelete", label: "Hapus", icon: <FileX className="size-3.5" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daftar Role</h2>
          <p className="text-sm text-secondary mt-0.5">{roles.length} role terdaftar</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="size-4" />
          Tambah Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4">
        {roles.length === 0 && (
          <Card className="p-12 text-center">
            <Shield className="size-10 text-secondary mx-auto mb-3" />
            <p className="text-secondary text-sm">Belum ada role. Buat role pertama.</p>
          </Card>
        )}
        {roles.map((role) => {
          const isExpanded = expandedRole === role.id;
          const totalPerms = role.permissions.reduce((acc, p) => {
            return acc + (p.canView ? 1 : 0) + (p.canCreate ? 1 : 0) + (p.canEdit ? 1 : 0) + (p.canDelete ? 1 : 0);
          }, 0);

          return (
            <Card key={role.id} className="overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${role.isSystem ? "bg-violet-100" : "bg-blue-100"}`}>
                  {role.isSystem
                    ? <ShieldCheck className="size-5 text-violet-600" />
                    : <Shield className="size-5 text-blue-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{role.name}</h3>
                    {role.isSystem && (
                      <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">SISTEM</span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-secondary mt-0.5 truncate">{role.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <Users className="size-3" /> {role._count.users} pengguna
                    </span>
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <ShieldCheck className="size-3" /> {totalPerms} permission aktif
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                    className="size-8 flex items-center justify-center rounded-lg text-secondary hover:bg-muted transition-colors"
                    title="Lihat permission"
                  >
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>
                  {!role.isSystem && (
                    <>
                      <button
                        onClick={() => openEdit(role)}
                        className="size-8 flex items-center justify-center rounded-lg text-secondary hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(role)}
                        className="size-8 flex items-center justify-center rounded-lg text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Permission Table */}
              {isExpanded && (
                <div className="border-t border-border bg-slate-50/50 p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-4 font-medium text-secondary text-xs">Menu</th>
                          {permCols.map((col) => (
                            <th key={col.key} className="text-center py-2 px-3 font-medium text-secondary text-xs">
                              <div className="flex items-center justify-center gap-1">{col.icon}{col.label}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {MENU_ITEMS.map((menu) => {
                          const perm = role.permissions.find((p) => p.menu === menu.key);
                          return (
                            <tr key={menu.key} className="border-b border-border/50 last:border-0">
                              <td className="py-2 pr-4 text-foreground text-xs font-medium">{menu.label}</td>
                              {permCols.map((col) => (
                                <td key={col.key} className="py-2 px-3 text-center">
                                  <span className={`inline-block size-4 rounded ${perm?.[col.key] ? "bg-green-500" : "bg-slate-200"}`} />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editRole ? "Edit Role" : "Tambah Role"}
        size="2xl"
      >
        <div className="space-y-4">
          <Input
            label="Nama Role"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="contoh: Manajer Divisi"
          />
          <Input
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Deskripsi singkat role ini"
          />

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Hak Akses Menu</label>
              <div className="flex gap-2">
                <button onClick={() => setAllMenus(true)} className="text-xs text-blue-600 hover:underline">Pilih Semua</button>
                <span className="text-secondary text-xs">·</span>
                <button onClick={() => setAllMenus(false)} className="text-xs text-secondary hover:underline">Hapus Semua</button>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="text-left py-2.5 px-3 font-medium text-secondary">Menu</th>
                    {permCols.map((col) => (
                      <th key={col.key} className="text-center py-2.5 px-2 font-medium text-secondary">
                        <div className="flex items-center justify-center gap-1">{col.icon}{col.label}</div>
                      </th>
                    ))}
                    <th className="text-center py-2.5 px-2 font-medium text-secondary">Semua</th>
                  </tr>
                </thead>
                <tbody>
                  {MENU_ITEMS.map((menu, idx) => {
                    const p = permMap[menu.key];
                    const allChecked = p.canView && p.canCreate && p.canEdit && p.canDelete;
                    return (
                      <tr key={menu.key} className={`border-b border-border/50 last:border-0 ${idx % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                        <td className="py-2.5 px-3 font-medium text-foreground">{menu.label}</td>
                        {permCols.map((col) => (
                          <td key={col.key} className="py-2.5 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={p[col.key]}
                              onChange={() => togglePerm(menu.key, col.key)}
                              className="size-4 accent-blue-600 cursor-pointer"
                            />
                          </td>
                        ))}
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={() => setAllForMenu(menu.key, !allChecked)}
                            className="size-4 accent-violet-600 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Batal</Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">
              {editRole ? "Simpan Perubahan" : "Buat Role"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Role"
        description={`Hapus role "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        isLoading={loading}
      />
    </div>
  );
}
