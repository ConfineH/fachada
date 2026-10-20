import { randomUUID } from "node:crypto";

import { tagsFromSentiments } from "@/lib/domain/incidents";
import { isAccountVerified } from "@/lib/domain/identity";
import { composeReviewBody } from "@/lib/domain/review-copy";
import { reviewRateLimitMessage } from "@/lib/domain/review-limits";
import {
  screenReviewText,
  type PrefilterResult,
} from "@/lib/domain/review-prefilter";
import {
  decidePublication,
  isPublicReview,
} from "@/lib/domain/review-visibility";
import type { Review, User } from "@/lib/domain/types";
import { reviewEditSchema, reviewInputSchema } from "@/lib/domain/validation";
import { notifyModerationQueue } from "@/lib/ops/moderation-alert";
import type { Repository } from "@/lib/repositories/types";
import type { EmailProvider } from "@/lib/services/email-provider";

export class ReviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewError";
  }
}

export class ReviewService {
  constructor(
    private readonly repo: Repository,
    private readonly email?: EmailProvider,
  ) {}

  async create(
    user: User | undefined,
    input: unknown,
    options: { evidencePath?: string } = {},
  ): Promise<Review> {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }

    const data = reviewInputSchema.parse(input);
    const agency =
      (data.agencyId
        ? await this.repo.findAgencyById(data.agencyId)
        : null) ??
      (data.agencySlug
        ? await this.repo.findAgencyBySlug(data.agencySlug)
        : null);
    if (!agency) {
      throw new ReviewError(
        "Inmobiliaria no encontrada. Recarga la ficha e inténtalo de nuevo.",
      );
    }
    const agencyId = agency.id;

    const userReviews = await this.repo.listReviewsByUser(user.id);
    const limit = reviewRateLimitMessage(userReviews, agencyId);
    if (limit) throw new ReviewError(limit);

    const anonymous = data.anonymous ?? true;
    const screen = screenReviewText({
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      publicName: anonymous ? undefined : data.publicName,
      agencyName: agency.name,
      city: data.experienceCity ?? agency.city,
      extraAllowedNames: [agency.legalName, agency.brandName].filter(
        (name): name is string => Boolean(name),
      ),
    });
    if (screen.outcome === "block") {
      throw new ReviewError(screen.hits.map((hit) => hit.message).join(" "));
    }
    const marked = markedExperience(data);
    const review: Review = {
      id: randomUUID(),
      userId: user.id,
      agencyId,
      role: data.role,
      rating: data.rating,
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      body: composeReviewBody(data.pros, data.cons),
      anonymous,
      publicName: anonymous ? undefined : data.publicName?.trim(),
      wouldRecommend: data.wouldRecommend,
      helpfulCount: 0,
      incidentTags: marked.incidentTags,
      incidentSentiments: marked.incidentSentiments,
      experienceDate: data.experienceDate,
      experienceType: data.experienceType,
      experienceCity: data.experienceCity,
      firstHandAttested: data.firstHandAttested,
      noIncentiveAttested: data.noIncentiveAttested,
      noConflictAttested: data.noConflictAttested,
      verificationLevel: "declarada",
      identityVerification: user.emailVerified ? "email" : "phone",
      evidencePath: options.evidencePath,
      evidenceDeleteAfter: options.evidencePath
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        : undefined,
      termsVersion: data.termsVersion,
      termsAcceptedAt: new Date(),
      createdAt: new Date(),
      moderated: false,
      flagged: false,
    };
    const notices = await this.publicationContext(user.id);
    await this.applyPublication(review, screen, notices);
    await this.repo.createReview(review);
    if (!review.moderated) {
      await notifyModerationQueue(this.email, {
        kind: "Reseña",
        detail: `«${review.title}» sobre ${agency.name} (${agency.city}).`,
      });
    }
    return review;
  }

  async update(
    user: User | undefined,
    reviewId: string,
    input: unknown,
  ): Promise<Review> {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }
    const review = await this.ownedReview(user.id, reviewId);
    const data = reviewEditSchema.parse(input);
    const anonymous = data.anonymous ?? true;
    const agency = await this.repo.findAgencyById(review.agencyId);
    const screen = screenReviewText({
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      publicName: anonymous ? undefined : data.publicName,
      agencyName: agency?.name,
      city: review.experienceCity ?? agency?.city,
      extraAllowedNames: [agency?.legalName, agency?.brandName].filter(
        (name): name is string => Boolean(name),
      ),
    });
    if (screen.outcome === "block") {
      throw new ReviewError(screen.hits.map((hit) => hit.message).join(" "));
    }
    const marked = markedExperience(data);
    const next: Review = {
      ...review,
      rating: data.rating,
      title: data.title,
      pros: data.pros,
      cons: data.cons,
      body: composeReviewBody(data.pros, data.cons),
      anonymous,
      publicName: anonymous ? undefined : data.publicName?.trim(),
      wouldRecommend: data.wouldRecommend ?? undefined,
      incidentTags: marked.incidentTags,
      incidentSentiments: marked.incidentSentiments,
      editedAt: new Date(),
      moderated: false,
      flagged: false,
      verificationLevel: "declarada",
    };
    const notices = await this.publicationContext(user.id, review.id);
    await this.applyPublication(next, screen, notices);
    await this.repo.updateReview(next);
    if (!next.moderated) {
      await notifyModerationQueue(this.email, {
        kind: "Reseña editada",
        detail: `«${next.title}» sobre ${agency?.name ?? "una ficha"} vuelve a la cola.`,
      });
    }
    return next;
  }

  async remove(user: User | undefined, reviewId: string): Promise<Review> {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }
    const review = await this.ownedReview(user.id, reviewId);
    const next: Review = {
      ...review,
      deletedAt: new Date(),
      moderated: false,
      flagged: true,
    };
    await this.repo.updateReview(next);
    return next;
  }

  async markHelpful(user: User | undefined, reviewId: string) {
    if (!isAccountVerified(user)) {
      throw new ReviewError("Account verification required");
    }
    const review = await this.repo.findReviewById(reviewId);
    if (!review || !isPublicReview(review)) {
      throw new ReviewError("Reseña no encontrada");
    }
    if (review.userId === user.id) {
      throw new ReviewError("No puedes marcar tu propia reseña como útil");
    }
    return this.repo.addReviewHelpful(user.id, reviewId);
  }

  private async publicationContext(userId: string, reviewId?: string) {
    const [ownReviews, notices] = await Promise.all([
      this.repo.listReviewsByUser(userId),
      this.repo.listContentNotices(),
    ]);
    const ids = new Set(ownReviews.map((review) => review.id));
    return {
      openNotices: notices.some(
        (notice) =>
          ids.has(notice.reviewId) &&
          (notice.status === "pendiente" ||
            notice.status === "informacion_requerida"),
      ),
      removedBefore: reviewId
        ? notices.some(
            (notice) =>
              notice.reviewId === reviewId && notice.status === "retirado",
          )
        : false,
    };
  }

  private async applyPublication(
    review: Review,
    screen: PrefilterResult,
    notices: { openNotices: boolean; removedBefore: boolean },
  ) {
    const user = await this.repo.findUserById(review.userId);
    const policy = await this.repo.getPublicationPolicy();
    const decision = decidePublication({
      mode: policy.mode,
      emailVerified: Boolean(user?.emailVerified),
      prefilter: screen.outcome === "hold" ? "hold" : "clean",
      openNotices: notices.openNotices,
      removedBefore: notices.removedBefore,
    });
    const held = screen.hits.filter(
      (hit) => hit.code === "crime_accusation" || hit.code === "person_name",
    );
    review.prefilterOutcome = screen.outcome === "hold" ? "held" : "clean";
    review.prefilterCodes = held.map((hit) => hit.code);
    review.prefilterReasons = held.map((hit) => hit.message);
    review.moderated = decision.publish;
    review.flagged = false;
    review.moderatedAt = decision.publish ? new Date() : undefined;
    review.moderationReason = decision.publish
      ? undefined
      : [...decision.reasons, ...review.prefilterReasons].join(" ");
  }

  private async ownedReview(userId: string, reviewId: string) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review || review.deletedAt) {
      throw new ReviewError("Reseña no encontrada");
    }
    if (review.userId !== userId) {
      throw new ReviewError("Solo puedes cambiar las reseñas que has escrito");
    }
    return review;
  }
}

function markedExperience(data: {
  incidentTags?: Review["incidentTags"];
  incidentSentiments?: Review["incidentSentiments"];
}) {
  const incidentSentiments = data.incidentSentiments ?? {};
  const fromSentiments = tagsFromSentiments(incidentSentiments);
  return {
    incidentSentiments,
    incidentTags:
      fromSentiments.length > 0 ? fromSentiments : (data.incidentTags ?? []),
  };
}
