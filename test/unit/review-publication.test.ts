import { describe, expect, it } from "vitest";

import {
  HOLD_INSULT,
  HOLD_NEW_ACCOUNT,
  HOLD_PERSONAL_DATA,
  HOLD_RESTRICTED,
  HOLD_THREAT,
  editPublication,
  initialPublication,
  textHoldReason,
} from "@/lib/domain/review-publication";

const CLEAN = "La gestión fue lenta con la fianza y las reparaciones.";

describe("textHoldReason", () => {
  it("lets a harsh criticism through", () => {
    expect(
      textHoldReason(
        "Son unos ladrones. La fianza no vuelve y la gestión es un timo.",
      ),
    ).toBeNull();
  });

  it("holds direct insults, threats and someone else's data", () => {
    expect(textHoldReason("Menuda gestión de gilipollas")).toBe(HOLD_INSULT);
    expect(textHoldReason("Hijo de puta el comercial")).toBe(HOLD_INSULT);
    expect(textHoldReason("Os voy a matar por la fianza")).toBe(HOLD_THREAT);
    expect(textHoldReason("Llamad a 600 111 222")).toBe(HOLD_PERSONAL_DATA);
    expect(textHoldReason("Su correo es ana@agencia.es")).toBe(
      HOLD_PERSONAL_DATA,
    );
    expect(textHoldReason("DNI 12345678Z en el contrato")).toBe(
      HOLD_PERSONAL_DATA,
    );
  });

  it("does not treat disputa or a short number as personal data or an insult", () => {
    expect(textHoldReason("Hubo una disputa por 600 euros")).toBeNull();
  });
});

describe("initialPublication", () => {
  const now = new Date("2026-10-08T12:00:00.000Z");

  it("holds the first review of an account created in the last 24 hours", () => {
    const decision = initialPublication({
      text: CLEAN,
      accountCreatedAt: new Date("2026-10-08T02:00:00.000Z"),
      hasPriorReview: false,
      now,
    });
    expect(decision).toEqual({ publish: false, reason: HOLD_NEW_ACCOUNT });
  });

  it("publishes a clean review from an older account, with or without a file", () => {
    const decision = initialPublication({
      text: CLEAN,
      accountCreatedAt: new Date("2026-10-06T12:00:00.000Z"),
      hasPriorReview: false,
      now,
    });
    expect(decision).toEqual({ publish: true });
  });

  it("publishes a later review from a new account", () => {
    const decision = initialPublication({
      text: CLEAN,
      accountCreatedAt: now,
      hasPriorReview: true,
      now,
    });
    expect(decision).toEqual({ publish: true });
  });

  it("holds a filtered review even when the account is old", () => {
    const decision = initialPublication({
      text: "Te reviento",
      accountCreatedAt: new Date("2026-01-01T00:00:00.000Z"),
      hasPriorReview: true,
      now,
    });
    expect(decision.publish).toBe(false);
    if (!decision.publish) expect(decision.reason).toBe(HOLD_THREAT);
  });
});

describe("editPublication", () => {
  const now = new Date("2026-10-08T12:00:00.000Z");
  const recent = new Date("2026-10-08T10:00:00.000Z");

  it("keeps a clean public review public", () => {
    expect(
      editPublication({
        text: CLEAN,
        wasFlagged: false,
        wasPublic: true,
        accountCreatedAt: recent,
        hasOtherReview: false,
        now,
      }),
    ).toEqual({ publish: true });
  });

  it("holds an edit that adds an insult", () => {
    const decision = editPublication({
      text: "Sois unos capullos",
      wasFlagged: false,
      wasPublic: true,
      accountCreatedAt: recent,
      hasOtherReview: true,
      now,
    });
    expect(decision).toEqual({ publish: false, reason: HOLD_INSULT });
  });

  it("does not let an edit skip a new-account hold", () => {
    expect(
      editPublication({
        text: CLEAN,
        wasFlagged: false,
        wasPublic: false,
        accountCreatedAt: recent,
        hasOtherReview: false,
        now,
      }),
    ).toEqual({ publish: false, reason: HOLD_NEW_ACCOUNT });
  });

  it("keeps a restricted review off the ficha until a person republishes it", () => {
    expect(
      editPublication({
        text: CLEAN,
        wasFlagged: true,
        wasPublic: false,
        accountCreatedAt: new Date("2026-01-01T00:00:00.000Z"),
        hasOtherReview: true,
        now,
      }),
    ).toEqual({
      publish: false,
      reason: HOLD_RESTRICTED,
      keepFlagged: true,
    });
  });
});
