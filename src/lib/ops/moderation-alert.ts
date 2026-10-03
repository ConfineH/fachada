import { publicMailbox } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import type { EmailProvider } from "@/lib/services/email-provider";

export async function notifyModerationQueue(
  email: EmailProvider | undefined,
  notice: { kind: string; detail: string },
) {
  const to = publicMailbox();
  if (!email || !to) return;
  try {
    await email.sendMessage(
      to,
      `Pendiente en Fachada: ${notice.kind}`,
      `${notice.detail}\n\nEstá en la cola de ${absoluteUrl("/admin")}.`,
    );
  } catch (error) {
    console.error("No se pudo avisar de una moderación pendiente", error);
  }
}
