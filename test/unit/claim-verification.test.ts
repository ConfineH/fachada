import { describe, expect, it } from "vitest";

import {
  hasStrongEvidence,
  validateClaimAntiImpersonation,
  workEmailMatchesAgency,
} from "@/lib/domain/claim-verification";
import type { Agency } from "@/lib/domain/types";

const agency: Agency = {
  id: "1",
  slug: "demo",
  name: "Inmobiliaria Sol",
  cif: "B12345678",
  address: "Calle Mayor 1",
  city: "Madrid",
  postalCode: "28013",
  phone: "+34911222333",
  phonePublished: true,
  email: "info@inmobiliariasol.es",
  website: "https://www.inmobiliariasol.es",
  claimed: false,
  verified: false,
  premium: false,
  createdAt: new Date(),
};

describe("claim anti-impersonation", () => {
  it("accepts corporate email and strong evidence", () => {
    expect(() =>
      validateClaimAntiImpersonation(
        {
          contactEmail: "ana@inmobiliariasol.es",
          companyCif: "B12345678",
          evidence: [
            { type: "cif_document", url: "https://example.com/cif.pdf" },
          ],
          attestationAccepted: true,
          agencyPhoneVerified: true,
        },
        agency,
      ),
    ).not.toThrow();
  });

  it("rejects free email without domain proof", () => {
    expect(() =>
      validateClaimAntiImpersonation(
        {
          contactEmail: "ana@gmail.com",
          evidence: [
            { type: "cif_document", url: "https://example.com/cif.pdf" },
          ],
          attestationAccepted: true,
          agencyPhoneVerified: true,
        },
        agency,
      ),
    ).toThrow(/corporativo/i);
  });

  it("requires strong documentary evidence", () => {
    expect(
      hasStrongEvidence([
        { type: "storefront_video", url: "https://example.com/v.mp4" },
      ]),
    ).toBe(false);
  });

  it("matches work email to agency domain", () => {
    expect(workEmailMatchesAgency("dir@inmobiliariasol.es", agency)).toBe(true);
    expect(workEmailMatchesAgency("dir@gmail.com", agency)).toBe(false);
  });

  it("validates document-only path when no public phone", () => {
    const opaque: Agency = {
      ...agency,
      phonePublished: false,
      phone: "",
      email: "pendiente@fachada.local",
      idealistaUrl: "https://www.idealista.com/pro/test/",
      website: undefined,
    };
    expect(() =>
      validateClaimAntiImpersonation(
        {
          contactEmail: "dir@empresa-test.es",
          evidence: [
            { type: "cif_document", url: "https://example.com/cif.pdf" },
            { type: "corporate_registry", url: "https://example.com/reg.pdf" },
            { type: "domain_proof", url: "https://example.com/dns.pdf" },
          ],
          attestationAccepted: true,
          agencyPhoneVerified: false,
        },
        opaque,
      ),
    ).not.toThrow();
  });
});
