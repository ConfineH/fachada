import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AuthError, AuthService } from "@/lib/services/auth-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

describe("AuthService", () => {
  let store: MemoryStore;
  let sms: MockSmsProvider;
  let service: AuthService;

  beforeEach(() => {
    store = new MemoryStore();
    sms = new MockSmsProvider();
    service = new AuthService(store, sms);
  });

  it("sends a 6-digit code for valid Spanish phone", async () => {
    await service.requestCode("+34600123456");
    expect(sms.sent).toHaveLength(1);
    expect(sms.sent[0]?.code).toMatch(/^\d{6}$/);
  });

  it("verifies correct code and creates session", async () => {
    await service.requestCode("+34600123456");
    const code = sms.lastCodeFor("+34600123456")!;

    const session = service.verifyCode("+34600123456", code);
    const user = service.getUserFromSession(session.token);

    expect(user?.phoneVerified).toBe(true);
  });

  it("rejects wrong code", async () => {
    await service.requestCode("+34600123456");
    expect(() => service.verifyCode("+34600123456", "000000")).toThrow(AuthError);
  });
});
