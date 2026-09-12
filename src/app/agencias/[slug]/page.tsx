import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { AgencyFichaTabs } from "@/components/agency-ficha-tabs";
import { AgencyMetadataCard } from "@/components/agency-metadata-card";
import { AgencyPresence } from "@/components/agency-presence";
import { AgencyReviewPatterns } from "@/components/agency-review-patterns";
import { ClaimForm } from "@/components/claim-form";
import { PublicShell } from "@/components/public-shell";
import { ReviewForm } from "@/components/review-form";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { SaveAgencyButton } from "@/components/save-agency-button";
import { SuggestFichaTipForm } from "@/components/suggest-ficha-tip-form";
import { agencyHasPublishedPhone, publicAgencyEmail } from "@/lib/domain/agency-contact";
import { publicStreetLine } from "@/lib/domain/agency-presence";
import { summarizeReviewPatterns } from "@/lib/domain/review-patterns";
import {
  agencyTrustedDomains,
  maskSpanishPhone,
} from "@/lib/domain/claim-verification";
import { agencyService, usingSupabase } from "@/lib/container";
import { cityToSlug } from "@/lib/domain/city";
import { agencyJsonLd, pageMeta } from "@/lib/seo";
import { isTwilioConfigured } from "@/lib/services/sms-provider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = await agencyService.getBySlug(slug, { publicOnly: true });
  if (!agency) return { title: "Inmobiliaria no encontrada" };
  const reviewHint =
    agency.reviewCount > 0
      ? `${agency.reviewCount} experiencias publicadas`
      : "aún sin experiencias publicadas";
  const title = `${agency.name} en ${agency.city}`;
  const description = `Cómo gestionan el alquiler en ${agency.name} (${agency.city}): fianzas, reparaciones y comunicación. ${reviewHint}.`;
  return pageMeta(title, description, `/agencias/${agency.slug}`);
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
    id: review.id,
    role: review.role,
    rating: review.rating,
    title: review.title,
    body: review.body,
    pros: review.pros,
    cons: review.cons,
    anonymous: review.anonymous,
    publicName: review.publicName,
    wouldRecommend: review.wouldRecommend,
    helpfulCount: review.helpfulCount,
    incidentTags: review.incidentTags,
    experienceDate: review.experienceDate.toISOString(),
    experienceType: review.experienceType,
    verificationLevel: review.verificationLevel,
    identityVerification: review.identityVerification,
    createdAt: review.createdAt.toISOString(),
    response: review.response
      ? {
          ...review.response,
          createdAt: review.response.createdAt.toISOString(),
        }
      : undefined,
  }));

  const totalReviews = agency.reviews.length;
  const patterns = summarizeReviewPatterns(agency.reviews);

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <JsonLd
        data={agencyJsonLd({
          name: agency.name,
          slug: agency.slug,
          city: agency.city,
          address: agency.address,
          postalCode: agency.postalCode,
          reviewCount: totalReviews,
          averageRating: agency.averageRating,
        })}
      />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Breadcrumbs
            items={[
              { name: "Ciudades", href: "/explorar" },
              {
                name: agency.city,
                href: `/ciudades/${cityToSlug(agency.city)}`,
              },
              { name: agency.name, href: `/agencias/${agency.slug}` },
            ]}
          />
          <div className="motion-fade-rise mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {agency.name} en {agency.city}
                </h1>
                {agency.verified && (
                  <span className="badge-trust">Ficha reclamada</span>
                )}
              </div>
              {agency.legalName && (
                <p className="mt-2 text-sm text-zinc-500">
                  {agency.legalName}
                  {agency.cif ? ` · CIF ${agency.cif}` : ""}
                </p>
              )}
              <p className="mt-4 text-sm text-zinc-700">
                {publicStreetLine(agency)}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-600">
                {agencyHasPublishedPhone(agency) ? (
                  <span>Tel. {agency.phone}</span>
                ) : (
                  <span className="badge-warning">
                    Teléfono no publicado
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
                Dejar una reseña
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Notas de inquilinos y propietarios
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

          <AgencyReviewPatterns summary={patterns} />

          <AgencyPresence
            agency={agency}
            locations={agency.locations}
            aliases={agency.aliases}
          />
          <div className="mt-4">
            <SuggestFichaTipForm
              agencySlug={agency.slug}
              agencyCity={agency.city}
            />
          </div>

          <h2 className="mt-12 text-xl font-semibold tracking-tight">
            Registro de experiencias
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {totalReviews}{" "}
            {totalReviews === 1
              ? "reseña publicada tras moderación."
              : "reseñas publicadas tras moderación."}
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
