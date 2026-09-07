import type {
  Agency,
  ClaimEvidenceItem,
  ClaimEvidenceType,
} from "@/lib/domain/types";
import { agencyHasPublishedPhone } from "@/lib/domain/agency-contact";

export const CLAIM_EVIDENCE_LABELS: Record<ClaimEvidenceType, string> = {
  cif_document: "Identificación fiscal (CIF/NIF de la sociedad)",
  corporate_registry: "Registro mercantil / nota simple",
  power_of_attorney: "Poder o acreditación de representación",
  domain_proof: "Prueba de control del dominio web corporativo",
  storefront_video: "Vídeo del local y fachada (refuerzo, opcional)",
};

export const REPRESENTATIVE_ROLE_LABELS = {
  director: "Director/a o gerente",
  administrador: "Administrador/a",
  comercial: "Responsable comercial",
  marketing: "Marketing / comunicación",
  rrhh: "RR. HH.",
  otro: "Otro cargo autorizado",
} as const;

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "live.com",
  "yahoo.com",
  "yahoo.es",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "gmx.es",
  "mail.com",
  "yandex.com",
]);

const STRONG_EVIDENCE: ClaimEvidenceType[] = [
  "cif_document",
  "corporate_registry",
  "power_of_attorney",
];

export function emailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase().trim() ?? "";
}

export function websiteDomain(website?: string) {
  if (!website?.trim()) return null;
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isFreeEmailDomain(domain: string) {
  return FREE_EMAIL_DOMAINS.has(domain);
}

export function agencyTrustedDomains(agency: Agency) {
  const domains = new Set<string>();
  const fromEmail = emailDomain(agency.email);
  if (
    fromEmail &&
    fromEmail !== "fachada.local" &&
    !isFreeEmailDomain(fromEmail)
  ) {
    domains.add(fromEmail);
  }
  const fromWeb = websiteDomain(agency.website);
  if (fromWeb) domains.add(fromWeb);
  return domains;
}

export function workEmailMatchesAgency(email: string, agency: Agency) {
  const domain = emailDomain(email);
  if (!domain || isFreeEmailDomain(domain)) return false;
  const trusted = agencyTrustedDomains(agency);
  if (trusted.size === 0) return false;
  return trusted.has(domain);
}

export function hasStrongEvidence(evidence: ClaimEvidenceItem[]) {
  return evidence.some((item) => STRONG_EVIDENCE.includes(item.type));
}

export function validateClaimAntiImpersonation(
  input: {
    contactEmail: string;
    companyCif?: string;
    evidence: ClaimEvidenceItem[];
    attestationAccepted: boolean;
    agencyPhoneVerified: boolean;
  },
  agency: Agency,
) {
  if (!input.attestationAccepted) {
    throw new Error("Debes confirmar que representas a la inmobiliaria");
  }

  if (agencyHasPublishedPhone(agency)) {
    if (!input.agencyPhoneVerified) {
      throw new Error(
        "Verifica el teléfono publicado de la inmobiliaria antes de enviar la reclamación",
      );
    }
    validateCorporateEmailAndEvidence(input, agency);
    return;
  }

  validateClaimDocumentOnlyPath(input, agency);
}

/** Sin teléfono público: solo revisión documental (cola admin estricta). */
export function validateClaimDocumentOnlyPath(
  input: {
    contactEmail: string;
    companyCif?: string;
    evidence: ClaimEvidenceItem[];
    attestationAccepted: boolean;
  },
  agency: Agency,
) {
  if (!input.attestationAccepted) {
    throw new Error("Debes confirmar que representas a la inmobiliaria");
  }

  validateCorporateEmailAndEvidence(input, agency);

  const strongCount = input.evidence.filter((e) =>
    STRONG_EVIDENCE.includes(e.type),
  ).length;
  const hasPortalOnAgency = Boolean(agency.idealistaUrl || agency.fotocasaUrl);
  const hasPortalProof = input.evidence.some(
    (e) => e.type === "storefront_video" || e.type === "domain_proof",
  );

  if (strongCount < 2 && !(strongCount >= 1 && (hasPortalOnAgency || hasPortalProof))) {
    throw new Error(
      "Sin teléfono público necesitamos más pruebas: dos documentos fuertes (CIF, registro, poder) o uno fuerte más enlace a portal/web en la ficha o prueba de dominio/vídeo",
    );
  }
}

function validateCorporateEmailAndEvidence(
  input: {
    contactEmail: string;
    companyCif?: string;
    evidence: ClaimEvidenceItem[];
  },
  agency: Agency,
) {
  const domain = emailDomain(input.contactEmail);
  if (!domain || isFreeEmailDomain(domain)) {
    throw new Error(
      "Usa un email corporativo (no Gmail, Outlook, etc.), como en Glassdoor",
    );
  }

  const trusted = agencyTrustedDomains(agency);
  const emailOk = trusted.size > 0 && trusted.has(domain);
  const domainProof = input.evidence.some((e) => e.type === "domain_proof");

  if (!emailOk && !domainProof) {
    throw new Error(
      `El email debe usar el dominio de la agencia (${[...trusted].join(", ") || "web o email en ficha"}) o adjunta prueba de dominio`,
    );
  }

  if (!hasStrongEvidence(input.evidence)) {
    throw new Error(
      "Adjunta al menos un documento fuerte: CIF, registro mercantil o poder de representación",
    );
  }

  if (agency.cif && input.companyCif) {
    const normalize = (c: string) => c.replace(/[\s-]/g, "").toUpperCase();
    if (normalize(agency.cif) !== normalize(input.companyCif)) {
      throw new Error("El CIF no coincide con el registrado en Fachada");
    }
  }
}

export function maskSpanishPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return phone;
  return `+${digits.slice(0, -4).replace(/^34/, "+34 ")}****${digits.slice(-2)}`;
}
