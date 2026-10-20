import { describe, expect, it } from "vitest";

import { noticeHidesProvisionally } from "@/lib/domain/content-notice-reasons";
import { experiencePublicLabel } from "@/lib/domain/review-copy";
import { reviewRateLimitMessage } from "@/lib/domain/review-limits";
import {
  compareModerationQueue,
  decidePublication,
  editMustStayQueued,
  isPublicReview,
  moderationSla,
} from "@/lib/domain/review-visibility";

const now = new Date("2026-10-20T12:00:00.000Z");

describe("publication visibility", () => {
  it("publishes immediately only with verified email, a clean prefilter and no open notices", () => {
    expect(
      decidePublication({
        mode: "immediate",
        emailVerified: true,
        prefilter: "clean",
        openNotices: false,
      }).publish,
    ).toBe(true);

    expect(
      decidePublication({
        mode: "immediate",
        emailVerified: false,
        prefilter: "clean",
        openNotices: false,
      }).publish,
    ).toBe(false);
    expect(
      decidePublication({
        mode: "immediate",
        emailVerified: true,
        prefilter: "hold",
        openNotices: false,
      }).publish,
    ).toBe(false);
    expect(
      decidePublication({
        mode: "immediate",
        emailVerified: true,
        prefilter: "clean",
        openNotices: true,
      }).publish,
    ).toBe(false);
    expect(
      decidePublication({
        mode: "premoderation",
        emailVerified: true,
        prefilter: "clean",
        openNotices: false,
      }).publish,
    ).toBe(false);
  });

  it("keeps an edited review in the queue after any manual restriction", () => {
    expect(
      editMustStayQueued({ flagged: true, moderated: true, moderatedAt: now }),
    ).toBe(true);
    expect(
      editMustStayQueued({ flagged: false, moderated: false, moderatedAt: now }),
    ).toBe(true);
    expect(
      editMustStayQueued({
        flagged: false,
        moderated: true,
        noticeStatuses: ["retirado"],
      }),
    ).toBe(true);
    expect(editMustStayQueued({ flagged: false, moderated: false })).toBe(false);
  });

  it("keeps public reviews to moderated, unflagged and not deleted", () => {
    expect(isPublicReview({ moderated: true, flagged: false })).toBe(true);
    expect(isPublicReview({ moderated: false, flagged: false })).toBe(false);
    expect(isPublicReview({ moderated: true, flagged: true })).toBe(false);
    expect(
      isPublicReview({ moderated: true, flagged: false, deletedAt: now }),
    ).toBe(false);
  });

  it("hides personal data and crime accusations provisionally, and leaves other notices visible", () => {
    expect(noticeHidesProvisionally("personal_data")).toBe(true);
    expect(noticeHidesProvisionally("offensive_or_crime")).toBe(true);
    expect(noticeHidesProvisionally("false_statement")).toBe(false);
    expect(noticeHidesProvisionally("not_customer")).toBe(false);
    expect(noticeHidesProvisionally("spam")).toBe(false);
    expect(noticeHidesProvisionally("other")).toBe(false);
  });

  it("orders the queue by risk and then by age, and marks a 48h SLA", () => {
    const older = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
    const newer = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const queued = [
      { id: "clean", flagged: false, prefilterCodes: [], createdAt: older },
      {
        id: "name",
        flagged: false,
        prefilterCodes: ["person_name"],
        createdAt: newer,
      },
      {
        id: "hidden",
        flagged: true,
        moderationReason: "Oculta de forma provisional: Datos personales.",
        createdAt: newer,
      },
      {
        id: "crime",
        flagged: false,
        prefilterCodes: ["crime_accusation"],
        createdAt: older,
      },
    ].sort(compareModerationQueue);

    expect(queued.map((item) => item.id)).toEqual([
      "hidden",
      "crime",
      "name",
      "clean",
    ]);
    expect(moderationSla(now, now).label).toMatch(/quedan 48 h/);
    expect(
      moderationSla(new Date(now.getTime() - 49 * 60 * 60 * 1000), now).overdue,
    ).toBe(true);
  });

  it("limits one live review per agency and three per day", () => {
    const reviews = [
      { agencyId: "a", createdAt: now },
      { agencyId: "b", createdAt: now },
    ];
    expect(reviewRateLimitMessage(reviews, "a", now)).toMatch(/una reseña por inmobiliaria/);
    expect(reviewRateLimitMessage(reviews, "c", now)).toBeNull();
    expect(
      reviewRateLimitMessage(
        [...reviews, { agencyId: "c", createdAt: now }],
        "d",
        now,
      ),
    ).toMatch(/3 reseñas/);
    expect(
      reviewRateLimitMessage(
        [{ agencyId: "a", createdAt: now, deletedAt: now }],
        "a",
        now,
      ),
    ).toBeNull();
  });

  it("never calls a declared experience verified", () => {
    expect(experiencePublicLabel("declarada")).toBe("Experiencia declarada");
    expect(experiencePublicLabel("declarada")).not.toMatch(/verificad/i);
    expect(experiencePublicLabel("acreditada")).toBe("Experiencia acreditada");
  });
});
