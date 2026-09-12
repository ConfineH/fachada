import type { Agency, AgencyLocation, AgencyNameAlias } from "@/lib/domain/types";
import {
  formatLocationLine,
  isConfirmedStreetAddress,
  publicStreetLine,
} from "@/lib/domain/agency-presence";

function locationKindLabel(kind: AgencyLocation["kind"]) {
  return kind === "branch" ? "Otra oficina" : "Ubicación observada";
}

export function AgencyPresence({
  agency,
  locations,
  aliases,
}: {
  agency: Agency;
  locations: AgencyLocation[];
  aliases: AgencyNameAlias[];
}) {
  const principalConfirmed = isConfirmedStreetAddress(agency.address);
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
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Oficina principal
            </dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {publicStreetLine(agency)}
            </dd>
            {!principalConfirmed ? (
              <p className="mt-1 text-xs text-zinc-500">
                Aún no hay una calle confirmada. Si la conoces, sugiérela más
                abajo.
              </p>
            ) : null}
          </div>
          {legalDistinct ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Domicilio social
              </dt>
              <dd className="mt-1 text-zinc-800">{agency.legalAddress}</dd>
            </div>
          ) : null}
          {locations.map((location) => (
            <div key={location.id}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {location.label || locationKindLabel(location.kind)}
              </dt>
              <dd className="mt-1 font-medium text-zinc-900">
                {formatLocationLine(location)}
              </dd>
              {location.note ? (
                <p className="mt-1 text-xs text-zinc-500">{location.note}</p>
              ) : null}
            </div>
          ))}
        </dl>
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
