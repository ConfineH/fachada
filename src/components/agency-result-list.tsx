import Link from "next/link";
import type { ReactNode } from "react";

import { RoleRatingSummary } from "@/components/role-rating-summary";
import { publicStreetLine } from "@/lib/domain/agency-presence";
import type { AgencyWithStats } from "@/lib/domain/types";

export function AgencyResultList({
  agencies,
  empty,
}: {
  agencies: AgencyWithStats[];
  empty: ReactNode;
}) {
  if (agencies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-zinc-600">
        {empty}
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {agencies.map((agency) => (
        <li key={agency.id}>
          <Link
            href={`/agencias/${agency.slug}`}
            className="card-interactive block p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{agency.name}</h3>
                <p className="text-sm text-zinc-600">
                  {publicStreetLine(agency)}
                </p>
              </div>
              <div className="min-w-[240px]">
                <RoleRatingSummary roleRatings={agency.roleRatings} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
