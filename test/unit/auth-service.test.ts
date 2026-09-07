import { beforeEach, describe, expect, it, vi } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AuthError, AuthService } from "@/lib/services/auth-service";
import { MockEmailProvider } from "@/lib/services/email-provider";
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

    const session = await service.verifyCode("+34600123456", code);
    const user = await service.getUserFromSession(session.token);

    expect(user?.phoneVerified).toBe(true);
  });

  it("does not leak the code unless exposeDevCode is enabled", async () => {
    const result = await service.requestCode("+34600123456");
    expect(result).not.toHaveProperty("devCode");
  });

  it("returns dev code when enabled for local testing", async () => {
    const devService = new AuthService(store, sms, true);
    const result = await devService.requestCode("+34600123456");

    expect(result.devCode).toMatch(/^\d{6}$/);
    expect(result.devCode).toBe(sms.lastCodeFor("+34600123456"));
  });

  it("rate-limits a second SMS to the same phone", async () => {
    await service.requestCode("+34600123456");
    await expect(service.requestCode("+34600123456")).rejects.toThrow(
      /recently sent/,
    );
  });

  it("rejects mock SMS in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(service.requestCode("+34600123456")).rejects.toThrow(
      /SMS provider not configured/,
    );
    vi.unstubAllEnvs();
  });

  it("rejects wrong code", async () => {
    await service.requestCode("+34600123456");
    await expect(service.verifyCode("+34600123456", "000000")).rejects.toThrow(
      AuthError,
    );
  });

  it("verifies email OTP and creates a session", async () => {
    const email = new MockEmailProvider();
    const emailAuth = new AuthService(store, sms, false, email, true);
    const requested = await emailAuth.requestEmailCode("Ana@Gmail.com");
    expect(requested.devCode).toMatch(/^\d{6}$/);
    expect(email.lastCodeFor("ana@gmail.com")).toBe(requested.devCode);

    const session = await emailAuth.verifyEmailCode(
      "Ana@Gmail.com",
      requested.devCode!,
    );
    const user = await emailAuth.getUserFromSession(session.token);
    expect(user?.email).toBe("ana@gmail.com");
    expect(user?.emailVerified).toBe(true);
  });

  it("rejects mock email in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(service.requestEmailCode("ana@gmail.com")).rejects.toThrow(
      /Email provider not configured/,
    );
    vi.unstubAllEnvs();
  });

  it("signs in with a verified Google email", async () => {
    const googleAuth = new AuthService(
      store,
      sms,
      false,
      new MockEmailProvider(),
      false,
      async () => "ana@gmail.com",
    );
    const session = await googleAuth.signInWithGoogle("fake-id-token");
    const user = await googleAuth.getUserFromSession(session.token);
    expect(user?.emailVerified).toBe(true);
    expect(user?.email).toBe("ana@gmail.com");
  });
});
