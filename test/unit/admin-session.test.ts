import { describe, expect, it } from "vitest";

import {
  adminActorFromToken,
  createAdminToken,
  verifyAdminToken,
} from "@/lib/auth/admin-session";

describe("admin session actor", () => {
  it("reads the name from the signed session, not from a later form field", () => {
    const token = createAdminToken("Ana Admin");
    expect(verifyAdminToken(token)).toBe(true);
    expect(adminActorFromToken(token)).toBe("Ana Admin");
    expect(adminActorFromToken(`${token}x`)).toBeNull();
    expect(() => createAdminToken(" ")).toThrow(/actor/i);
  });
});
