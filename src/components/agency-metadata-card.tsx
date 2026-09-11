import type { Agency, AgencyNameAlias } from "@/lib/domain/types";
import { publicStreetLine } from "@/lib/domain/agency-presence";

export function AgencyMetadataCard({
  agency,
  aliases = [],
}: {
  agency: Agency;
  aliases?: AgencyNameAlias[];
}) {
  const portalNames = aliases.filter((alias) => alias.kind === "commercial");

  return (
    <div className="card-raised p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Ficha
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-zinc-500">Oficina principal</dt>
          <dd className="font-medium text-zinc-900">{publicStreetLine(agency)}</dd>
        </div>
        {agency.legalName && (
          <div>
            <dt className="text-zinc-500">Razón social</dt>
            <dd className="font-medium text-zinc-900">{agency.legalName}</dd>
          </div>
        )}
        {agency.cif && (
          <div>
            <dt className="text-zinc-500">Identificador fiscal</dt>
            <dd className="font-mono text-sm text-zinc-900">{agency.cif}</dd>
          </div>
        )}
        {agency.website && (
          <div>
            <dt className="text-zinc-500">Web</dt>
            <dd>
              <a href={agency.website} className="link-brand" target="_blank" rel="noreferrer">
                {agency.website.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        )}
        {portalNames.length > 0 && (
          <div>
            <dt className="text-zinc-500">Nombres en anuncios</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {portalNames.map((alias) => (
                <span
                  key={alias.id}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700"
                >
                  {alias.alias}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
