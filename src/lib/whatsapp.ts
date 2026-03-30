interface SendWAMessage {
  target: string; // phone number
  message: string;
}

export async function sendWhatsAppMessage({ target, message }: SendWAMessage): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.warn("[WhatsApp] FONNTE_TOKEN not set, skipping WA send");
    return false;
  }

  // Normalize number: remove leading 0, add 62
  const normalized = target.startsWith("0") ? "62" + target.slice(1) : target;

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: normalized,
        message,
        countryCode: "62",
      }),
    });

    const data = await res.json();
    if (data.status === true) {
      return true;
    }
    console.error("[WhatsApp] Send failed:", data);
    return false;
  } catch (err) {
    console.error("[WhatsApp] Error:", err);
    return false;
  }
}

export function buildReminderMessage(params: {
  userName: string;
  taskName: string;
  programKerjaName: string;
  targetDate: Date | null;
  status: string;
}): string {
  const { userName, taskName, programKerjaName, targetDate, status } = params;
  const tgl = targetDate ? targetDate.toLocaleDateString("id-ID") : "belum ditentukan";
  return `*[Monitoring Sapphire Grup]*\n\nHalo ${userName},\n\nPengingat SLA untuk:\n📋 *Program Kerja:* ${programKerjaName}\n✅ *Task:* ${taskName}\n📅 *Target Date:* ${tgl}\n🔴 *Status:* ${status}\n\nSegera update progress Anda. Terima kasih!`;
}
