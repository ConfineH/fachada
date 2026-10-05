import type { Agency, AgencyLocation, AgencyNameAlias } from "@/lib/domain/types";
import { presenceGroups } from "@/lib/domain/company-presence";

export function AgencyPresence({
  agency,
  locations,
  aliases,
}: {
  agency: Agency;
  locations: AgencyLocation[];
  aliases: AgencyNameAlias[];
}) {
  const legalDistinct =
    Boolean(agency.legalAddress) &&
    agency.legalAddress!.toLowerCase() !== agency.address.toLowerCase();
  const former = aliases.filter((alias) => alias.kind === "former");
  const legalAliases = aliases.filter((alias) => alias.kind === "legal");
  const portalNames = aliases.filter((alias) => alias.kind === "commercial");
  const showHistory =
    former.length > 0 ||
    legalAliases.length > 0 ||
    Boolean(agency.legalName && agency.legalName !== agency.name);

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-semibold tracking-tight">
          ¿Dónde los puedes encontrar?
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          El domicilio que figura en papeles no siempre es donde atienden.
        </p>
        <div className="mt-4 space-y-4 text-sm">
          {presenceGroups(agency, locations).map((group) => (
            <div key={group.city}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {group.city}
              </h3>
              <ul className="mt-1 space-y-1">
                {group.lines.map((line) => (
                  <li key={line} className="font-medium text-zinc-900">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {legalDistinct ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Domicilio social
              </dt>
              <dd className="mt-1 text-zinc-800">{agency.legalAddress}</dd>
            </div>
          ) : null}
        </div>
      </section>

      {showHistory ? (
        <section className="rounded-xl border border-stone-200 bg-zinc-50 p-5">
          <h2 className="text-lg font-semibold tracking-tight">Historial</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Misma empresa, otros nombres. Las reseñas se quedan en esta ficha.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-800">
            {agency.legalName && agency.legalName !== agency.name ? (
              <li>
                <span className="text-zinc-500">Razón social:</span>{" "}
                {agency.legalName}
                {agency.cif ? ` · CIF ${agency.cif}` : ""}
              </li>
            ) : null}
            {legalAliases.map((alias) => (
              <li key={alias.id}>
                <span className="text-zinc-500">Nombre legal:</span> {alias.alias}
                {alias.note ? ` — ${alias.note}` : ""}
              </li>
            ))}
            {former.map((alias) => (
              <li key={alias.id}>
                <span className="text-zinc-500">Antes:</span> {alias.alias}
                {alias.effectiveUntil
                  ? ` (hasta ${alias.effectiveUntil.getFullYear()})`
                  : ""}
                {alias.note ? ` — ${alias.note}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-stone-300 bg-zinc-50 p-5">
          <h2 className="text-lg font-semibold tracking-tight">Historial</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Si se llamaban de otra forma, o la razón social no es este nombre,{" "}
            <a href="#aportar-dato" className="underline">
              apórtalo abajo
            </a>
            .
          </p>
        </section>
      )}

      {portalNames.length > 0 ? (
        <p className="text-xs text-zinc-500">
          En anuncios también como{" "}
          {portalNames.map((alias) => alias.alias).join(", ")}.
        </p>
      ) : null}
    </div>
  );
}
