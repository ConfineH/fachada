import catalog from "../../../data/madrid-pilot-agencies.json";
import { buildAgencySlug } from "@/lib/domain/agency-slug";

export type MadridPilotAgency = {
  name: string;
  address: string;
  postalCode: string;
  website: string;
  aliases: string[];
};

export const MADRID_PILOT_AGENCIES = catalog as MadridPilotAgency[];

export function madridPilotSlug(name: string) {
  return buildAgencySlug(name, "Madrid");
}
