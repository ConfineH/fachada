import Link from "next/link";

import {
  AGENCY_SORT_OPTIONS,
  type AgencySort,
} from "@/lib/domain/agency-browse";

export function AgencyBrowseControls({
  action,
  query,
  sort,
  searchLabel = "Buscar inmobiliaria",
  placeholder = "Nombre de la agencia…",
}: {
  action: string;
  query: string;
  sort: AgencySort;
  searchLabel?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <form action={action} method="get" className="relative max-w-md flex-1">
        <input type="hidden" name="orden" value={sort} />
        <label className="sr-only" htmlFor="agency-browse-q">
          {searchLabel}
        </label>
        <input
          id="agency-browse-q"
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          className="input-field min-h-11 rounded-full pl-5"
        />
        <button
          type="submit"
          className="btn-primary absolute right-1.5 top-1.5 min-h-9 rounded-full px-4 text-xs"
        >
          Buscar
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {AGENCY_SORT_OPTIONS.map((option) => {
          const params = new URLSearchParams();
          if (query) params.set("q", query);
          if (option.id !== "reviews") params.set("orden", option.id);
          const href = params.size > 0 ? `${action}?${params}` : action;
          const active = sort === option.id;
          return (
            <Link
              key={option.id}
              href={href}
              className={`filter-chip ${
                active ? "filter-chip-active" : "filter-chip-idle"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
