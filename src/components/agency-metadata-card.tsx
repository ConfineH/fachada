import type { Agency, AgencyNameAlias } from "@/lib/domain/types";

export function AgencyMetadataCard({
  agency,
  aliases = [],
}: {
  agency: Agency;
  aliases?: AgencyNameAlias[];
}) {
  return (
    <div className="card-raised p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Metadatos operativos
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
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
        <div>
          <dt className="text-zinc-500">Ciudad</dt>
          <dd className="font-medium text-zinc-900">
            {agency.city} {agency.postalCode}
          </dd>
        </div>
        {aliases.length > 0 && (
          <div>
            <dt className="text-zinc-500">Marcas secundarias</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {aliases.map((alias) => (
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
      <div
        className="mt-5 aspect-[4/3] rounded-lg border border-zinc-100 bg-gradient-to-br from-zinc-100 to-zinc-50"
        role="img"
        aria-label={`Ubicación aproximada en ${agency.city}`}
      />
    </div>
  );
}
