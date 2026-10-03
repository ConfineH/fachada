import { describe, expect, it } from "vitest";

import { summarizeReviewFunnel } from "@/lib/domain/review-funnel";
import { notifyModerationQueue } from "@/lib/ops/moderation-alert";
import { MockEmailProvider } from "@/lib/services/email-provider";

describe("review funnel", () => {
  it("counts submitted, pending, published, flagged and fichas", () => {
    const funnel = summarizeReviewFunnel([
      { agencyId: "a", moderated: true, flagged: false },
      { agencyId: "a", moderated: true, flagged: false },
      { agencyId: "b", moderated: false, flagged: false },
      { agencyId: "c", moderated: false, flagged: true },
      { agencyId: "d", moderated: true, flagged: false, deletedAt: new Date() },
    ]);
    expect(funnel).toEqual({
      submitted: 4,
      pending: 1,
      published: 2,
      flagged: 1,
      agenciesWithPublishedReview: 1,
    });
  });
});

describe("moderation alert", () => {
  it("mails the public contact and ignores a send failure", async () => {
    process.env.LEGAL_CONTACT_EMAIL = "tony@example.com";
    const email = new MockEmailProvider();
    await notifyModerationQueue(email, {
      kind: "Reseña",
      detail: "«Buen trato» sobre Sol (Madrid).",
    });
    expect(email.messages).toHaveLength(1);
    expect(email.messages[0]?.email).toBe("tony@example.com");
    expect(email.messages[0]?.subject).toBe("Pendiente en Fachada: Reseña");

    email.sendMessage = async () => {
      throw new Error("resend down");
    };
    await expect(
      notifyModerationQueue(email, { kind: "Reseña", detail: "otra" }),
    ).resolves.toBeUndefined();
    delete process.env.LEGAL_CONTACT_EMAIL;
  });

  it("stays quiet without a mailbox", async () => {
    delete process.env.LEGAL_CONTACT_EMAIL;
    const email = new MockEmailProvider();
    await notifyModerationQueue(email, { kind: "Reseña", detail: "x" });
    expect(email.messages).toHaveLength(0);
  });
});
