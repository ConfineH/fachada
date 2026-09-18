import type { AgencyTipKind } from "@/lib/domain/types";

export const AGENCY_TIP_KINDS = [
  "principal",
  "branch",
  "former_name",
  "legal_name",
  "logo",
] as const satisfies readonly AgencyTipKind[];

export const AGENCY_TIP_KIND_LABELS: Record<AgencyTipKind, string> = {
  principal: "Oficina principal",
  branch: "Otra oficina",
  former_name: "Se llamaban de otra forma",
  legal_name: "Razón social",
  logo: "Logotipo",
};

export function isLocationTip(kind: AgencyTipKind) {
  return kind === "principal" || kind === "branch";
}

export function isNameTip(kind: AgencyTipKind) {
  return kind === "former_name" || kind === "legal_name";
}

export function isLogoTip(kind: AgencyTipKind) {
  return kind === "logo";
}
