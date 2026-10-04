import Link from "next/link";
import type { ReactNode } from "react";

import { AgencyLogo } from "@/components/agency-logo";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { publicStreetLine } from "@/lib/domain/agency-presence";
import { agencyLogoUrl } from "@/lib/ops/agency-logos";
import type { AgencyWithStats } from "@/lib/domain/types";

export function AgencyResultList({
  agencies,
  empty,
  layout = "list",
}: {
  agencies: AgencyWithStats[];
  empty: ReactNode;
  layout?: "list" | "board";
}) {
  if (agencies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-zinc-600">
        {empty}
      </div>
    );
  }

  return (
    <ul
      className={
        layout === "board" ? "grid gap-4 md:grid-cols-2" : "grid gap-4"
      }
    >
      {agencies.map((agency) => (
        <li key={agency.id}>
          <Link
            href={`/agencias/${agency.slug}`}
            className="card-interactive block h-full p-5"
          >
            <div
              className={
                layout === "board"
                  ? "flex h-full flex-col gap-4"
                  : "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              }
            >
              <div className="flex items-start gap-3">
                <AgencyLogo
                  name={agency.name}
                  src={agencyLogoUrl(agency.logoPath)}
                />
                <div>
                  <h3 className="text-lg font-semibold">{agency.name}</h3>
                  <p className="text-sm text-zinc-600">
                    {publicStreetLine(agency)}
                  </p>
                </div>
              </div>
              <div className={layout === "board" ? "mt-auto w-full" : "min-w-[240px]"}>
                <RoleRatingSummary roleRatings={agency.roleRatings} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
