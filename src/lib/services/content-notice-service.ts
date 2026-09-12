import { randomUUID } from "node:crypto";

import type { ContentNotice, User } from "@/lib/domain/types";
import {
  contentNoticeAppealSchema,
  contentNoticeDecisionSchema,
  contentNoticeInputSchema,
} from "@/lib/domain/validation";
import type { Repository } from "@/lib/repositories/types";
import type { EmailProvider } from "@/lib/services/email-provider";

export class ContentNoticeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentNoticeError";
  }
}

export class ContentNoticeService {
  constructor(
    private readonly repo: Repository,
    private readonly email: EmailProvider,
  ) {}

  async create(input: unknown): Promise<ContentNotice> {
    const data = contentNoticeInputSchema.parse(input);
    const review = await this.repo.findReviewById(data.reviewId);
    if (!review) throw new ContentNoticeError("Reseña no encontrada");

    const existing = await this.repo.listContentNotices();
    const duplicate = existing.some(
      (notice) =>
        notice.reviewId === data.reviewId &&
        notice.reporterEmail === data.reporterEmail &&
        notice.status === "pendiente",
    );
    if (duplicate) {
      throw new ContentNoticeError(
        "Ya existe una denuncia pendiente de este email para esta reseña",
      );
    }

    const now = new Date();
    const notice: ContentNotice = {
      id: randomUUID(),
      reviewId: review.id,
      reporterName: data.reporterName,
      reporterEmail: data.reporterEmail,
      relationship: data.relationship,
      category: data.category,
      exactExcerpt: data.exactExcerpt,
      legalReason: data.legalReason,
      evidenceUrl: data.evidenceUrl,
      goodFaithAttested: data.goodFaithAttested,
      status: "pendiente",
      createdAt: now,
      acknowledgedAt: now,
    };

    await this.repo.createContentNotice(notice);
    await Promise.allSettled([
      this.email.sendMessage(
        notice.reporterEmail,
        `Denuncia recibida — ${notice.id}`,
        [
          "Hemos recibido tu denuncia de contenido.",
          `Referencia: ${notice.id}`,
          "La revisará una persona y recibirás una decisión motivada en este email.",
        ].join("\n"),
      ),
    ]);
    return notice;
  }

  async decide(id: string, input: unknown): Promise<ContentNotice> {
    const data = contentNoticeDecisionSchema.parse(input);
    const notice = await this.repo.findContentNoticeById(id);
    if (!notice) throw new ContentNoticeError("Denuncia no encontrada");
    const review = await this.repo.findReviewById(notice.reviewId);
    if (!review) throw new ContentNoticeError("Reseña no encontrada");

    const previousStatus = notice.status;
    notice.status = data.status;
    notice.decisionRule = data.decisionRule;
    notice.decisionReason = data.decisionReason;
    notice.decidedAt = new Date();
    if (notice.appealedAt && !notice.appealDecidedAt) {
      notice.appealDecidedAt = new Date();
      notice.appealDecision =
        previousStatus === data.status ? "confirmada" : "revocada";
      notice.appealDecisionReason = data.decisionReason;
    }

    if (data.status === "retirado") {
      review.flagged = true;
      review.moderated = true;
    } else if (data.status === "mantenido") {
      review.flagged = false;
    } else {
      review.flagged = true;
    }
    review.moderationReason = `${data.decisionRule}: ${data.decisionReason}`;
    review.moderatedAt = new Date();

    const author = await this.repo.findUserById(review.userId);
    await this.repo.updateReview(review);
    await this.repo.updateContentNotice(notice);

    const reporterNotification = this.email.sendMessage(
        notice.reporterEmail,
        `Decisión sobre tu denuncia — ${notice.id}`,
        `${data.decisionRule}\n\n${data.decisionReason}`,
      );
    const authorNotification = author?.email
      ? this.email.sendMessage(
          author.email,
          `Decisión de moderación sobre tu reseña — ${notice.id}`,
          [
            `Resultado: ${data.status}`,
            `Regla aplicada: ${data.decisionRule}`,
            data.decisionReason,
            "Puedes pedir una revisión humana desde Tu cuenta en Fachada.",
          ].join("\n\n"),
        )
      : undefined;
    const results = await Promise.allSettled(
      authorNotification
        ? [reporterNotification, authorNotification]
        : [reporterNotification],
    );
    if (results[0]?.status === "fulfilled") {
      notice.reporterNotifiedAt = new Date();
    }
    if (authorNotification && results[1]?.status === "fulfilled") {
      notice.authorNotifiedAt = new Date();
    }
    await this.repo.updateContentNotice(notice);
    return notice;
  }

  async appeal(
    user: User | undefined,
    id: string,
    input: unknown,
  ): Promise<ContentNotice> {
    if (!user) throw new ContentNoticeError("Identificación necesaria");
    const data = contentNoticeAppealSchema.parse(input);
    const notice = await this.repo.findContentNoticeById(id);
    if (!notice) throw new ContentNoticeError("Denuncia no encontrada");
    if (!notice.decidedAt) {
      throw new ContentNoticeError("La denuncia todavía no tiene decisión");
    }
    const review = await this.repo.findReviewById(notice.reviewId);
    if (!review || review.userId !== user.id) {
      throw new ContentNoticeError("No puedes revisar esta decisión");
    }
    if (notice.appealedAt) {
      throw new ContentNoticeError("Esta decisión ya tiene una revisión abierta");
    }
    notice.appealedAt = new Date();
    notice.appealReason = data.appealReason;
    await this.repo.updateContentNotice(notice);
    return notice;
  }
}
