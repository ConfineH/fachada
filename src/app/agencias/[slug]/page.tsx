import Link from "next/link";
import { notFound } from "next/navigation";

import { AgencyFichaTabs } from "@/components/agency-ficha-tabs";
import { AgencyMetadataCard } from "@/components/agency-metadata-card";
import { ClaimForm } from "@/components/claim-form";
import { PublicShell } from "@/components/public-shell";
import { ReviewForm } from "@/components/review-form";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { SaveAgencyButton } from "@/components/save-agency-button";
import { agencyHasPublishedPhone, publicAgencyEmail } from "@/lib/domain/agency-contact";
import {
  agencyTrustedDomains,
  maskSpanishPhone,
} from "@/lib/domain/claim-verification";
import { agencyService, usingSupabase } from "@/lib/container";
import { isTwilioConfigured } from "@/lib/services/sms-provider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = await agencyService.getBySlug(slug, { publicOnly: true });
  if (!agency) return { title: "Inmobiliaria — Fachada" };
  return {
    title: `${agency.name} en ${agency.city} — reseñas Fachada`,
    description: `Opiniones de inquilinos y propietarios sobre ${agency.name} en ${agency.city}.`,
  };
}

export default async function AgencyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ perspectiva?: string }>;
}) {
  const { slug } = await params;
  const { perspectiva } = await searchParams;
  const agency = await agencyService.getBySlug(slug, { publicOnly: true });
  if (!agency) notFound();

  const perspectiveHint =
    perspectiva === "inquilino"
      ? "Estás viendo la ficha con foco en inquilinos."
      : perspectiva === "propietario"
        ? "Estás viendo la ficha con foco en propietarios."
        : null;

  const publicEmail = publicAgencyEmail(agency.email);
  const trustedDomains = [...agencyTrustedDomains(agency)];
  const emailDomainHint = trustedDomains[0] ?? "tudominio.es";

  const reviewsForClient = agency.reviews.map((review) => ({
    ...review,
    createdAt: review.createdAt.toISOString(),
    response: review.response
      ? {
          ...review.response,
          createdAt: review.response.createdAt.toISOString(),
        }
      : undefined,
  }));

  const totalReviews = agency.reviews.length;

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Link href="/explorar" className="link-brand text-sm">
            ← Explorar ciudades
          </Link>
          <div className="motion-fade-rise mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {agency.name}
                </h1>
                {agency.verified && (
                  <span className="badge-trust">Identidad verificada</span>
                )}
              </div>
              {agency.legalName && (
                <p className="mt-2 text-sm text-zinc-500">
                  {agency.legalName}
                  {agency.cif ? ` · CIF ${agency.cif}` : ""}
                </p>
              )}
              <p className="mt-4 text-sm text-zinc-700">
                {agency.address}, {agency.postalCode} {agency.city}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-600">
                {agencyHasPublishedPhone(agency) ? (
                  <span>Tel. {agency.phone}</span>
                ) : (
                  <span className="badge-warning">
                    Contacto no verificado (sin teléfono público)
                  </span>
                )}
                {publicEmail ? <span>{publicEmail}</span> : null}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SaveAgencyButton agencyId={agency.id} />
              <a
                href="#dejar-resena"
                className="btn-primary inline-flex min-h-11 shrink-0 items-center justify-center px-6"
              >
                Añadir reseña
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Índice de reputación
          </h2>
          <div className="mt-4">
            <RoleRatingSummary
              roleRatings={agency.roleRatings}
              variant="profile"
            />
          </div>
          {perspectiveHint && (
            <p className="mt-4 text-sm text-zinc-700">{perspectiveHint}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link
              href={`/agencias/${slug}?perspectiva=inquilino`}
              className="rounded-full border border-stone-300 px-3 py-1 transition hover:border-zinc-400"
            >
              Soy inquilino
            </Link>
            <Link
              href={`/agencias/${slug}?perspectiva=propietario`}
              className="rounded-full border border-stone-300 px-3 py-1 transition hover:border-zinc-400"
            >
              Soy propietario
            </Link>
          </div>

          {agency.aliases.length > 0 && (
            <div className="mt-8 rounded-xl border border-stone-200 bg-zinc-50 p-4 text-sm">
              <p className="font-medium text-zinc-800">También conocida como</p>
              <ul className="mt-2 list-inside list-disc text-zinc-700">
                {agency.aliases.map((alias) => (
                  <li key={alias.id}>
                    {alias.alias}
                    {alias.note ? ` — ${alias.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="mt-12 text-xl font-semibold tracking-tight">
            Registro de experiencias
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {totalReviews} reseñas publicadas tras moderación.
          </p>
          <div className="mt-6">
            <AgencyFichaTabs
              reviews={reviewsForClient}
              initialFilter={perspectiva}
              portalLinks={{
                idealistaUrl: agency.idealistaUrl,
                fotocasaUrl: agency.fotocasaUrl,
              }}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <AgencyMetadataCard agency={agency} aliases={agency.aliases} />
          <div id="dejar-resena">
            <ReviewForm agencySlug={agency.slug} />
          </div>
          <div className="rounded-xl bg-brand p-6 text-white">
            <h3 className="text-lg font-semibold">Portal corporativo</h3>
            <p className="mt-2 text-sm text-zinc-300">
              ¿Eres el representante legal? Reclama la ficha para responder a
              las reseñas publicadas.
            </p>
            <div className="mt-4 [&_.rounded-xl]:border-zinc-600 [&_.rounded-xl]:bg-zinc-800/50 [&_h3]:text-white [&_input]:border-zinc-600 [&_input]:bg-zinc-900/40 [&_label]:text-zinc-200 [&_p]:text-zinc-300">
              <ClaimForm
                agencyId={agency.id}
                agencyClaimed={agency.claimed}
                agencyPhonePublished={agencyHasPublishedPhone(agency)}
                agencyPhoneHint={maskSpanishPhone(agency.phone)}
                agencyEmailDomainHint={emailDomainHint}
                requiresCif={Boolean(agency.cif)}
                businessSmsEnabled={isTwilioConfigured()}
              />
            </div>
          </div>
          <Link
            href={`/agencia/${slug}/panel`}
            className="link-brand block text-center text-sm"
          >
            Panel inmobiliaria
          </Link>
          {(agency.idealistaUrl || agency.fotocasaUrl) && (
            <p className="text-center text-sm text-zinc-600">
              Portales:{" "}
              {agency.idealistaUrl && (
                <a
                  href={agency.idealistaUrl}
                  className="link-brand"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Idealista
                </a>
              )}
              {agency.idealistaUrl && agency.fotocasaUrl ? " · " : ""}
              {agency.fotocasaUrl && (
                <a
                  href={agency.fotocasaUrl}
                  className="link-brand"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Fotocasa
                </a>
              )}
            </p>
          )}
        </aside>
      </main>
    </PublicShell>
  );
}
