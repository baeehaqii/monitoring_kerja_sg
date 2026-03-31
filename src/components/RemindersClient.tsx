"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CalendarX,
  MessageSquare,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type SlaAlert = {
  id: string;
  name: string;
  programKerja: {
    name: string;
    targetDate: string | null;
    strategy: { division: { name: string } };
    raciResponsible: string | null;
  };
  weeklyProgress: { status: string }[];
};

type SentReminder = {
  id: string;
  sentAt: string | null;
  message: string;
  user: { id: string; name: string; email: string };
  actionPlan: {
    id: string;
    name: string;
    programKerja: {
      name: string;
      strategy: { division: { name: string } };
    };
  };
};

type UserItem = { id: string; name: string; email: string; whatsappNumber: string | null };

interface Props {
  slaAlerts: SlaAlert[];
  sentHistory: SentReminder[];
  users: UserItem[];
  currentUserId: string;
  isAdmin: boolean;
  now: string;
}

function getDaysUntil(dateStr: string | null, now: Date): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getAlertSeverity(daysUntil: number | null): "overdue" | "critical" | "warning" {
  if (daysUntil === null || daysUntil < 0) return "overdue";
  if (daysUntil === 0) return "overdue";
  if (daysUntil <= 1) return "critical";
  return "warning";
}

export function RemindersClient({
  slaAlerts,
  sentHistory,
  users,
  currentUserId,
  isAdmin,
  now,
}: Props) {
  const router = useRouter();
  const nowDate = new Date(now);

  const [previewAlert, setPreviewAlert] = useState<SlaAlert | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [sending, setSending] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  function buildMessage(alert: SlaAlert, recipientName: string): string {
    const tgl = alert.programKerja.targetDate
      ? new Date(alert.programKerja.targetDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "belum ditentukan";
    const days = getDaysUntil(alert.programKerja.targetDate, nowDate);
    const status = alert.weeklyProgress[0]?.status ?? "NOT_STARTED";
    const statusLabel: Record<string, string> = {
      NOT_STARTED: "Belum Mulai",
      ON_PROGRESS: "On Progress",
      DELAY: "Terlambat",
    };
    const daysNote =
      days === null
        ? ""
        : days < 0
        ? `\n⚠️ Sudah melewati batas waktu ${Math.abs(days)} hari lalu.`
        : days === 0
        ? `\n⚠️ Hari ini adalah batas waktu terakhir!`
        : `\n⏳ Sisa waktu: *${days} hari* lagi.`;

    return (
      `*[Monitoring Sapphire Grup]*\n\n` +
      `Halo ${recipientName},\n\n` +
      `Berikut pengingat SLA untuk action plan yang perlu segera ditindaklanjuti:\n\n` +
      `📁 *Divisi:* ${alert.programKerja.strategy.division.name}\n` +
      `📋 *Program Kerja:* ${alert.programKerja.name}\n` +
      `✅ *Action Plan:* ${alert.name}\n` +
      `📅 *Target Selesai:* ${tgl}` +
      daysNote +
      `\n🔴 *Status:* ${statusLabel[status] ?? status}\n\n` +
      `Mohon segera update progress atau koordinasi dengan tim terkait.\n\nTerima kasih! 🙏`
    );
  }

  function openPreview(alert: SlaAlert) {
    setPreviewAlert(alert);
    setCustomMessage("");
    setSelectedUserId(isAdmin && users.length > 0 ? users[0].id : currentUserId);
  }

  function closePreview() {
    setPreviewAlert(null);
    setCustomMessage("");
    setSelectedUserId("");
  }

  async function handleSend() {
    if (!previewAlert) return;
    setSending(true);

    const recipient = users.find((u) => u.id === selectedUserId);
    const recipientName = recipient?.name ?? "Tim";
    const message = customMessage.trim() || buildMessage(previewAlert, recipientName);

    await fetch("/api/reminders/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionPlanId: previewAlert.id,
        userId: selectedUserId || currentUserId,
        message,
      }),
    });

    setSentIds((prev) => new Set(prev).add(previewAlert.id));
    setSending(false);
    closePreview();
    router.refresh();
  }

  const overdue = slaAlerts.filter((a) => {
    const d = getDaysUntil(a.programKerja.targetDate, nowDate);
    return d !== null && d <= 0;
  });
  const upcoming = slaAlerts.filter((a) => {
    const d = getDaysUntil(a.programKerja.targetDate, nowDate);
    return d !== null && d > 0;
  });

  const previewRecipient = users.find((u) => u.id === selectedUserId);
  const previewMessage =
    customMessage.trim() ||
    (previewAlert ? buildMessage(previewAlert, previewRecipient?.name ?? "Tim") : "");

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-4 text-sm">
          {overdue.length > 0 && (
            <span className="flex items-center gap-1.5 text-red-600 font-medium">
              <CalendarX className="w-4 h-4" />
              {overdue.length} melewati deadline
            </span>
          )}
          {upcoming.length > 0 && (
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <Clock className="w-4 h-4" />
              {upcoming.length} mendekati deadline
            </span>
          )}
          {slaAlerts.length === 0 && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <Bell className="w-4 h-4" />
              Semua action plan on track
            </span>
          )}
        </div>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarX className="w-3.5 h-3.5" /> Melewati Batas Waktu
          </p>
          <div className="space-y-3">
            {overdue.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                nowDate={nowDate}
                alreadySent={sentIds.has(alert.id)}
                onSend={() => openPreview(alert)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming (within 3 days) */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Mendekati Batas Waktu (3 Hari)
          </p>
          <div className="space-y-3">
            {upcoming.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                nowDate={nowDate}
                alreadySent={sentIds.has(alert.id)}
                onSend={() => openPreview(alert)}
              />
            ))}
          </div>
        </div>
      )}

      {slaAlerts.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
            <p className="text-sm font-medium text-slate-500">Semua action plan aman</p>
            <p className="text-xs">Tidak ada yang mendekati atau melewati deadline dalam 3 hari ke depan.</p>
          </div>
        </Card>
      )}

      {/* Sent history */}
      {sentHistory.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Riwayat Notifikasi Terkirim
          </p>
          <div className="space-y-2">
            {sentHistory.map((r) => (
              <Card key={r.id} className="flex items-start gap-3 opacity-80">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium text-slate-700">{r.actionPlan.name}</p>
                    <Badge variant="success">Terkirim</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.actionPlan.programKerja.name} · {r.actionPlan.programKerja.strategy.division.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Ke: {r.user.name} · {r.sentAt ? formatDate(r.sentAt) : "-"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* WA Preview Modal */}
      <Modal
        open={!!previewAlert}
        onClose={closePreview}
        title="Preview Notifikasi WhatsApp"
        size="lg"
      >
        {previewAlert && (
          <div className="space-y-4">
            {/* Recipient picker */}
            {isAdmin && users.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Kirim ke
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.whatsappNumber ? `(${u.whatsappNumber})` : "(no WA)"}
                    </option>
                  ))}
                </select>
                {previewRecipient && !previewRecipient.whatsappNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    User ini belum punya nomor WhatsApp — pesan tidak akan terkirim.
                  </p>
                )}
              </div>
            )}

            {/* Message preview */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Preview Pesan
              </label>
              <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed border border-green-200">
                {previewMessage}
              </div>
            </div>

            {/* Custom message override */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Pesan Kustom <span className="text-slate-400 font-normal">(opsional — kosongkan untuk pakai otomatis)</span>
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Tulis pesan kustom di sini..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={closePreview}>
                Batal
              </Button>
              <Button
                onClick={handleSend}
                loading={sending}
                icon={<Send className="w-4 h-4" />}
                disabled={isAdmin && !selectedUserId}
              >
                Kirim WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AlertCard({
  alert,
  nowDate,
  alreadySent,
  onSend,
}: {
  alert: SlaAlert;
  nowDate: Date;
  alreadySent: boolean;
  onSend: () => void;
}) {
  const days = getDaysUntil(alert.programKerja.targetDate, nowDate);
  const severity = getAlertSeverity(days);
  const status = alert.weeklyProgress[0]?.status ?? "NOT_STARTED";

  const severityStyle = {
    overdue: {
      border: "border-red-200",
      bg: "bg-red-50",
      icon: "bg-red-100",
      iconColor: "text-red-500",
      label: days !== null && days < 0 ? `${Math.abs(days)} hari terlambat` : "Hari ini deadline!",
      labelColor: "text-red-600",
    },
    critical: {
      border: "border-orange-200",
      bg: "bg-orange-50",
      icon: "bg-orange-100",
      iconColor: "text-orange-500",
      label: "Besok deadline",
      labelColor: "text-orange-600",
    },
    warning: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      icon: "bg-amber-100",
      iconColor: "text-amber-500",
      label: `${days} hari lagi`,
      labelColor: "text-amber-600",
    },
  }[severity];

  return (
    <div
      className={`rounded-2xl border ${severityStyle.border} ${severityStyle.bg} p-4 flex items-start gap-3`}
    >
      <div
        className={`w-9 h-9 rounded-xl ${severityStyle.icon} flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <AlertTriangle className={`w-4 h-4 ${severityStyle.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-800">{alert.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {alert.programKerja.strategy.division.name} › {alert.programKerja.name}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-bold ${severityStyle.labelColor}`}>
              {severityStyle.label}
            </span>
            <StatusBadge status={status} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
          <p className="text-xs text-slate-500">
            Target:{" "}
            {alert.programKerja.targetDate
              ? new Date(alert.programKerja.targetDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </p>
          {alreadySent ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Notifikasi terkirim
            </span>
          ) : (
            <Button size="sm" onClick={onSend} icon={<Send className="w-3.5 h-3.5" />}>
              Kirim Notif WA
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
