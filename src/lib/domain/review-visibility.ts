import type { PublicationMode, Review } from "@/lib/domain/types";

type ReviewVisibility = Pick<Review, "moderated" | "flagged" | "deletedAt">;

export const DEFAULT_PUBLICATION_MODE: PublicationMode = "immediate";
export const MODERATION_SLA_MS = 48 * 60 * 60 * 1000;

export function isPublicReview(review: ReviewVisibility) {
  return Boolean(review.moderated && !review.flagged && !review.deletedAt);
}

/** A manual restriction, not only a notice marked «retirado». */
export function editMustStayQueued(input: {
  flagged: boolean;
  moderated: boolean;
  moderatedAt?: Date;
  noticeStatuses?: string[];
}) {
  if (input.flagged) return true;
  if (input.moderatedAt && !input.moderated) return true;
  return (input.noticeStatuses ?? []).some((status) => status === "retirado");
}

export function decidePublication(input: {
  mode: PublicationMode;
  emailVerified: boolean;
  prefilter: "clean" | "hold";
  openNotices: boolean;
  removedBefore?: boolean;
}): { publish: boolean; reasons: string[] } {
  if (input.mode === "premoderation") {
    return {
      publish: false,
      reasons: ["Modo pre-moderación: espera aprobación humana."],
    };
  }
  const reasons: string[] = [];
  if (input.prefilter === "hold") {
    reasons.push("Retenida por el prefiltro hasta revisión humana.");
  }
  if (!input.emailVerified) {
    reasons.push("El correo de la cuenta no está verificado.");
  }
  if (input.openNotices) {
    reasons.push("Hay un aviso de contenido abierto.");
  }
  if (input.removedBefore) {
    reasons.push(
      "Una restricción anterior impide republicar esta edición. Vuelve a la cola.",
    );
  }
  if (reasons.length > 0) return { publish: false, reasons };
  return { publish: true, reasons: [] };
}

type QueueItem = {
  flagged: boolean;
  prefilterCodes?: string[];
  moderationReason?: string;
  createdAt: Date | string;
};

export function moderationRisk(review: QueueItem) {
  const codes = review.prefilterCodes ?? [];
  const provisional =
    review.flagged &&
    (review.moderationReason ?? "").startsWith("Oculta de forma provisional");
  if (provisional) return 0;
  if (review.flagged) return 1;
  if (codes.includes("crime_accusation")) return 2;
  if (codes.includes("person_name")) return 3;
  return 4;
}

export function compareModerationQueue<T extends QueueItem>(a: T, b: T) {
  const risk = moderationRisk(a) - moderationRisk(b);
  if (risk !== 0) return risk;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export function moderationSla(createdAt: Date | string, now = new Date()) {
  const remainingMs = MODERATION_SLA_MS - (now.getTime() - new Date(createdAt).getTime());
  if (remainingMs <= 0) {
    return { overdue: true as const, label: "SLA de 48 h vencido" };
  }
  const hours = Math.max(1, Math.ceil(remainingMs / 3_600_000));
  return { overdue: false as const, label: `SLA 48 h: quedan ${hours} h` };
}
