import Link from "next/link";

import { RoleRatingSummary } from "@/components/role-rating-summary";
import type { AgencyRoleRatings } from "@/lib/domain/ratings";

export function BrandRollup({
  brandName,
  companyCount,
  roleRatings,
  place = "ficha",
}: {
  brandName: string;
  companyCount: number;
  roleRatings: AgencyRoleRatings;
  place?: "ficha" | "registro";
}) {
  return (
    <aside className="rounded-xl border border-stone-200 bg-stone-50 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">
          En el conjunto de la marca {brandName}
        </h2>
        <Link href="/metodologia#marca" className="text-sm text-zinc-600 underline">
          ¿Por qué hay varias empresas?
        </Link>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        Misma marca, otra empresa. El CIF no es el de al lado. Esta cifra junta{" "}
        {companyCount} empresas.{" "}
        {place === "ficha"
          ? "La nota de esta ficha es solo la de aquí."
          : "Cada ficha de abajo es una empresa. Esta cifra no sustituye la suya."}
      </p>
      <div className="mt-4">
        <RoleRatingSummary roleRatings={roleRatings} />
      </div>
    </aside>
  );
}
