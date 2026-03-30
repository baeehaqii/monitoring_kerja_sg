"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Bell, Plus, Send, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Reminder = {
  id: string;
  reminderDate: string;
  message: string;
  sent: boolean;
  sentAt: string | null;
  user: { id: string; name: string; email: string };
  actionPlan: {
    id: string;
    name: string;
    programKerja: {
      name: string;
      strategy: { division: { name: string } };
      targetDate: string | null;
    };
    weeklyProgress: { status: string }[];
  };
};

type ActionPlan = {
  id: string;
  name: string;
  programKerja: {
    name: string;
    strategy: { division: { name: string } };
  };
};

type UserItem = { id: string; name: string; email: string; whatsappNumber: string | null };

interface Props {
  reminders: Reminder[];
  actionPlans: ActionPlan[];
  users: UserItem[];
  currentUserId: string;
  isAdmin: boolean;
}

export function RemindersClient({ reminders, actionPlans, users, currentUserId, isAdmin }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    actionPlanId: "",
    userId: currentUserId,
    reminderDate: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setAddOpen(false);
    setForm({ actionPlanId: "", userId: currentUserId, reminderDate: "", message: "" });
    router.refresh();
  }

  async function handleSendAll() {
    setSending(true);
    await fetch("/api/reminders", { method: "PUT" });
    setSending(false);
    router.refresh();
  }

  const pending = reminders.filter((r) => !r.sent);
  const sent = reminders.filter((r) => r.sent);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Bell className="w-4 h-4" />
          <span><span className="font-semibold text-slate-700">{pending.length}</span> reminder pending</span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && pending.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              loading={sending}
              onClick={handleSendAll}
              icon={<Send className="w-4 h-4" />}
            >
              Kirim Semua Sekarang
            </Button>
          )}
          <Button onClick={() => setAddOpen(true)} size="sm" icon={<Plus className="w-4 h-4" />}>
            Tambah Reminder
          </Button>
        </div>
      </div>

      {/* Pending Reminders */}
      {pending.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Belum Terkirim</p>
          <div className="space-y-2">
            {pending.map((r) => (
              <Card key={r.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium text-slate-800">{r.actionPlan.name}</p>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{r.actionPlan.programKerja.name} · {r.actionPlan.programKerja.strategy.division.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>Untuk: {r.user.name}</span>
                    <span>Jadwal: {formatDate(r.reminderDate)}</span>
                  </div>
                  {r.message && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{r.message}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sent Reminders */}
      {sent.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Riwayat Terkirim</p>
          <div className="space-y-2">
            {sent.map((r) => (
              <Card key={r.id} className="flex items-start gap-3 opacity-75">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium text-slate-700">{r.actionPlan.name}</p>
                    <Badge variant="success">Terkirim</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{r.actionPlan.programKerja.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Untuk: {r.user.name} · Terkirim: {r.sentAt ? formatDate(r.sentAt) : "-"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && sent.length === 0 && (
        <Card>
          <p className="text-center text-slate-400 py-8 text-sm">Belum ada reminder.</p>
        </Card>
      )}

      {/* Add Reminder Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Reminder SLA" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <Select
            label="Action Plan"
            required
            value={form.actionPlanId}
            onChange={(e) => setForm({ ...form, actionPlanId: e.target.value })}
            options={actionPlans.map((ap) => ({
              value: ap.id,
              label: `${ap.programKerja.strategy.division.name} › ${ap.programKerja.name} › ${ap.name}`,
            }))}
            placeholder="Pilih action plan..."
          />
          {isAdmin && users.length > 0 && (
            <Select
              label="Kirim Kepada"
              required
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.name} ${u.whatsappNumber ? `(WA: ${u.whatsappNumber})` : "(no WA)"}`,
              }))}
            />
          )}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Tanggal Pengingat <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={form.reminderDate}
              onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f52ba]/20 focus:border-[#0f52ba]"
            />
          </div>
          <Textarea
            label="Pesan Kustom (opsional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Biarkan kosong untuk menggunakan pesan otomatis..."
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
