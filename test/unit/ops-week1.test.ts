import { afterEach, describe, expect, it, vi } from "vitest";

import { isProductionAdminMisconfigured } from "@/lib/auth/admin-session";
import {
  getLegal,
  hasPublicContact,
  hasRegisteredHolder,
  publicMailbox,
} from "@/lib/legal";
import { organizationJsonLd } from "@/lib/seo";

const keys = [
  "LEGAL_HOLDER_NAME",
  "LEGAL_HOLDER_ID",
  "LEGAL_HOLDER_ADDRESS",
  "LEGAL_CONTACT_EMAIL",
  "LEGAL_PRIVACY_EMAIL",
  "ADMIN_PASSWORD",
] as const;

const previous = new Map<string, string | undefined>();

function snapshotEnv() {
  for (const key of keys) {
    previous.set(key, process.env[key]);
  }
}

function restoreEnv() {
  for (const key of keys) {
    const value = previous.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.unstubAllEnvs();
}

describe("legal identity env", () => {
  afterEach(restoreEnv);

  it("is incomplete with placeholders", () => {
    snapshotEnv();
    delete process.env.LEGAL_HOLDER_NAME;
    delete process.env.LEGAL_HOLDER_ID;
    delete process.env.LEGAL_HOLDER_ADDRESS;
    delete process.env.LEGAL_CONTACT_EMAIL;
    delete process.env.LEGAL_PRIVACY_EMAIL;
    expect(hasPublicContact()).toBe(false);
    expect(hasRegisteredHolder()).toBe(false);
    expect(publicMailbox()).toBeNull();
    expect(getLegal().holderName.startsWith("[")).toBe(true);
  });

  it("is ready with only a contact email", () => {
    snapshotEnv();
    delete process.env.LEGAL_HOLDER_NAME;
    delete process.env.LEGAL_HOLDER_ID;
    delete process.env.LEGAL_HOLDER_ADDRESS;
    delete process.env.LEGAL_PRIVACY_EMAIL;
    process.env.LEGAL_CONTACT_EMAIL = "ada@example.com";
    expect(hasPublicContact()).toBe(true);
    expect(hasRegisteredHolder()).toBe(false);
    expect(publicMailbox()).toBe("ada@example.com");
    expect(getLegal().privacyEmail).toBe("ada@example.com");
    expect(organizationJsonLd().email).toBe("ada@example.com");
    expect(organizationJsonLd().address).toBeUndefined();
  });

  it("exposes the registered holder when those env vars are filled", () => {
    snapshotEnv();
    process.env.LEGAL_HOLDER_NAME = "Ada Lovelace";
    process.env.LEGAL_HOLDER_ID = "12345678Z";
    process.env.LEGAL_HOLDER_ADDRESS = "Calle Ejemplo 1, Madrid";
    process.env.LEGAL_CONTACT_EMAIL = "ada@example.com";
    expect(hasPublicContact()).toBe(true);
    expect(hasRegisteredHolder()).toBe(true);
    expect(organizationJsonLd().address).toMatchObject({
      "@type": "PostalAddress",
      streetAddress: "Calle Ejemplo 1, Madrid",
    });
  });
});

describe("production admin password", () => {
  afterEach(restoreEnv);

  it("flags the default password in production", () => {
    snapshotEnv();
    vi.stubEnv("NODE_ENV", "production");
    process.env.ADMIN_PASSWORD = "fachada-admin-dev";
    expect(isProductionAdminMisconfigured()).toBe(true);
  });

  it("accepts a rotated secret in production", () => {
    snapshotEnv();
    vi.stubEnv("NODE_ENV", "production");
    process.env.ADMIN_PASSWORD = "un-secreto-largo";
    expect(isProductionAdminMisconfigured()).toBe(false);
  });
});
