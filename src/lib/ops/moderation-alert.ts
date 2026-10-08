import { publicMailbox } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import type { EmailProvider } from "@/lib/services/email-provider";

export async function notifyModerationQueue(
  email: EmailProvider | undefined,
  notice: { kind: string; detail: string; queued?: boolean },
) {
  const to = publicMailbox();
  if (!email || !to) return;
  const queued = notice.queued !== false;
  try {
    await email.sendMessage(
      to,
      queued
        ? `Pendiente en Fachada: ${notice.kind}`
        : `Fachada: ${notice.kind}`,
      queued
        ? `${notice.detail}\n\nEstá en la cola de ${absoluteUrl("/admin")}.`
        : `${notice.detail}\n\nNo hace falta aprobarla. El panel está en ${absoluteUrl("/admin")}.`,
    );
  } catch (error) {
    console.error("No se pudo avisar de una moderación pendiente", error);
  }
}
