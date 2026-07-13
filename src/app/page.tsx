import Link from "next/link";

import { agencyService } from "@/lib/container";
import { SearchForm } from "@/components/search-form";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const agencies = agencyService.search(q);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
              Fachada
            </p>
            <h1 className="text-2xl font-semibold">
              Reseñas reales de inmobiliarias en España
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-medium">Buscar inmobiliaria</h2>
          <p className="mt-2 text-stone-600">
            Encuentra agencias por nombre o ciudad. Lee experiencias de
            inquilinos y propietarios.
          </p>
          <div className="mt-6">
            <SearchForm initialQuery={q ?? ""} />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {q ? `Resultados para "${q}"` : "Inmobiliarias destacadas"}
            </h2>
            <span className="text-sm text-stone-500">
              {agencies.length} resultados
            </span>
          </div>

          <ul className="grid gap-4">
            {agencies.map((agency) => (
              <li key={agency.id}>
                <Link
                  href={`/agencias/${agency.slug}`}
                  className="block rounded-xl border border-stone-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{agency.name}</h3>
                      <p className="text-sm text-stone-600">
                        {agency.address}, {agency.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-amber-700">
                        {agency.reviewCount > 0
                          ? agency.averageRating.toFixed(1)
                          : "—"}
                      </p>
                      <p className="text-xs text-stone-500">
                        {agency.reviewCount} reseñas
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
