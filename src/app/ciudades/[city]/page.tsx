import Link from "next/link";
import { notFound } from "next/navigation";

import { CityPhoto } from "@/components/city-photo";
import { PublicShell } from "@/components/public-shell";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { slugToCityLabel } from "@/lib/domain/city";
import { publicStreetLine } from "@/lib/domain/agency-presence";
import { agencyService, usingSupabase } from "@/lib/container";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const label = slugToCityLabel(city);
  return {
    title: `Inmobiliarias en ${label} — reseñas Fachada`,
    description: `Opiniones de inquilinos y propietarios sobre inmobiliarias en ${label}.`,
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const agencies = await agencyService.listByCity(city, { publicOnly: true });
  if (agencies.length === 0) notFound();

  const label = agencies[0]?.city ?? slugToCityLabel(city);

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <header className="relative min-h-[220px] overflow-hidden border-b border-stone-200">
        <CityPhoto slug={city} city={label} priority sizes="100vw" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16 text-white">
          <Link href="/explorar" className="text-sm text-white/80 underline-offset-2 hover:underline">
            ← Explorar ciudades
          </Link>
          <h1 className="motion-fade-rise mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Inmobiliarias en {label}
          </h1>
          <p className="mt-2 text-white/80">
            {agencies.length}{" "}
            {agencies.length === 1 ? "agencia" : "agencias"} con reseñas de
            gestión publicadas.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <ul className="motion-stagger space-y-4">
          {agencies.map((agency) => (
            <li key={agency.id} className="card-interactive p-6">
              <Link
                href={`/agencias/${agency.slug}`}
                className="text-xl font-semibold text-zinc-900 hover:underline"
              >
                {agency.name}
              </Link>
              <p className="mt-1 text-sm text-zinc-600">
                {publicStreetLine(agency)}
              </p>
              <div className="mt-4">
                <RoleRatingSummary roleRatings={agency.roleRatings} />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </PublicShell>
  );
}
