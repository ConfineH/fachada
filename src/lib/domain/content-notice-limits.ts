import {
  noticeHidesProvisionally,
  noticeReasonLabel,
} from "@/lib/domain/content-notice-reasons";
import type { ContentNoticeCategory } from "@/lib/domain/types";

export const NOTICES_PER_REPORTER_PER_DAY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

type CountedNotice = {
  reporterEmail: string;
  reporterIp?: string;
  createdAt: Date;
};

export function noticeRateLimitMessage(input: {
  notices: CountedNotice[];
  email: string;
  ip?: string;
  now?: Date;
}): string | null {
  const since = (input.now ?? new Date()).getTime() - DAY_MS;
  const recent = input.notices.filter(
    (notice) => notice.createdAt.getTime() >= since,
  );
  const email = input.email.trim().toLowerCase();
  const byEmail = recent.filter(
    (notice) => notice.reporterEmail.trim().toLowerCase() === email,
  ).length;
  if (byEmail >= NOTICES_PER_REPORTER_PER_DAY) {
    return "Has llegado al límite de 5 avisos en 24 horas desde este correo.";
  }
  if (input.ip) {
    const byIp = recent.filter((notice) => notice.reporterIp === input.ip).length;
    if (byIp >= NOTICES_PER_REPORTER_PER_DAY) {
      return "Has llegado al límite de 5 avisos en 24 horas desde esta conexión.";
    }
  }
  return null;
}

export function noticeShouldHide(input: {
  category: ContentNoticeCategory;
  reporterVerified: boolean;
  reviewFlagged: boolean;
  moderationReason?: string;
  sameReasonKept?: boolean;
}) {
  if (!input.reporterVerified || !noticeHidesProvisionally(input.category)) {
    return false;
  }
  if (input.sameReasonKept) return false;
  const label = noticeReasonLabel(input.category);
  const alreadyHiddenForReason =
    input.reviewFlagged && (input.moderationReason ?? "").includes(label);
  return !alreadyHiddenForReason;
}
