import { getSiteUrl } from "@/lib/site-url";

const PLACEHOLDERS = {
  holderName: "[Nombre y apellidos o razón social]",
  holderId: "[NIF / NIE / CIF]",
  holderAddress: "[Domicilio a efectos de notificaciones, España]",
  contactEmail: "[correo de contacto que leas de verdad]",
  privacyEmail: "[mismo correo o uno dedicado a privacidad]",
} as const;

function readEnv(key: string, placeholder: string) {
  const value = process.env[key]?.trim();
  return value ? value : placeholder;
}

export function isPlaceholder(value: string) {
  return value.startsWith("[");
}

export function getLegal() {
  const contactEmail = readEnv("LEGAL_CONTACT_EMAIL", PLACEHOLDERS.contactEmail);
  return {
    serviceName: "Fachada",
    siteUrl: getSiteUrl(),
    holderName: readEnv("LEGAL_HOLDER_NAME", PLACEHOLDERS.holderName),
    holderId: readEnv("LEGAL_HOLDER_ID", PLACEHOLDERS.holderId),
    holderAddress: readEnv("LEGAL_HOLDER_ADDRESS", PLACEHOLDERS.holderAddress),
    contactEmail,
    privacyEmail: readEnv("LEGAL_PRIVACY_EMAIL", contactEmail),
  };
}

/** Public phase: a mailbox we read. No name, NIF or address on the site yet. */
export function hasPublicContact() {
  const email = getLegal().contactEmail;
  return !isPlaceholder(email) && email.includes("@");
}

/** Real contact email, or null so pages never print the placeholder. */
export function publicMailbox() {
  return hasPublicContact() ? getLegal().contactEmail : null;
}

/** After SL (or a deliberate full LSSI identity): name, tax id, address. */
export function hasRegisteredHolder() {
  const legal = getLegal();
  return ![legal.holderName, legal.holderId, legal.holderAddress].some(
    isPlaceholder,
  );
}
