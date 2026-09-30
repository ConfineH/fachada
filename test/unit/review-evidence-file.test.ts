import { describe, expect, it } from "vitest";

import { evidenceWithinLimit } from "@/lib/review-evidence-file";

describe("review evidence size", () => {
  it("accepts a file up to 3 MB", () => {
    expect(evidenceWithinLimit(3 * 1024 * 1024)).toBe(true);
    expect(evidenceWithinLimit(3 * 1024 * 1024 + 1)).toBe(false);
  });
});
