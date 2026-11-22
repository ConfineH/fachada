import { describe, expect, it } from "vitest";

import { REVIEW_TERMS_VERSION } from "@/lib/domain/review-authenticity";
import { reviewMultipartFields } from "@/lib/domain/review-form-data";
import { reviewInputSchema } from "@/lib/domain/validation";

const AGENCY_ID = "11111111-1111-4111-8111-111111111111";

function reviewForm(extra?: (form: FormData) => void) {
  const form = new FormData();
  form.set("agencyId", AGENCY_ID);
  form.set("agencySlug", "inmobiliaria-sol-madrid");
  form.set("role", "inquilino");
  form.set("rating", "4");
  form.set("title", "Devolución de la fianza");
  form.set(
    "narrative",
    "Tardaron tres semanas en devolver la fianza del piso.",
  );
  form.set("pros", "Devolvieron la fianza en el plazo.");
  form.set("cons", "Tardaron en contestar los correos.");
  form.set("anonymous", "true");
  form.set("incidentTags", "[]");
  form.set("incidentSentiments", "{}");
  form.set("experienceDate", "2026-06-01");
  form.set("experienceType", "alquiler");
  form.set("experienceCity", "Madrid");
  form.set("firstHandAttested", "true");
  form.set("noIncentiveAttested", "true");
  form.set("noConflictAttested", "true");
  form.set("termsAccepted", "true");
  form.set("termsVersion", REVIEW_TERMS_VERSION);
  form.set("evidence", new File(["page"], "pagina.jpg", { type: "image/jpeg" }));
  extra?.(form);
  return form;
}

describe("review multipart fields", () => {
  it("keeps the flat city when an evidence file is attached", () => {
    const fields = reviewMultipartFields(reviewForm());
    expect(fields.experienceCity).toBe("Madrid");
    expect(reviewInputSchema.parse(fields).experienceCity).toBe("Madrid");
  });

  it("still rejects a multipart review that omits the flat city", () => {
    const fields = reviewMultipartFields(
      reviewForm((form) => form.delete("experienceCity")),
    );
    expect(fields.experienceCity).toBeUndefined();
    const parsed = reviewInputSchema.safeParse(fields);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.path.join("."))).toContain(
        "experienceCity",
      );
    }
  });

  it("treats a skipped recommendation as unset, matching the JSON payload", () => {
    expect(reviewMultipartFields(reviewForm()).wouldRecommend).toBeUndefined();
    const yes = reviewForm((form) => form.set("wouldRecommend", "true"));
    const no = reviewForm((form) => form.set("wouldRecommend", "false"));
    expect(reviewMultipartFields(yes).wouldRecommend).toBe(true);
    expect(reviewMultipartFields(no).wouldRecommend).toBe(false);
  });
});
