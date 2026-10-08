import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { AgencyLogo } from "@/components/agency-logo";
import { AgencyReviewList } from "@/components/agency-review-list";
import { AgencyMetadataCard } from "@/components/agency-metadata-card";
import { AgencyPresence } from "@/components/agency-presence";
import { AgencyReviewPatterns } from "@/components/agency-review-patterns";
import { IncidentSentimentSummary } from "@/components/incident-sentiment-summary";
import { ClaimForm } from "@/components/claim-form";
import { PublicShell } from "@/components/public-shell";
import { ReviewForm } from "@/components/review-form";
import { BrandRollup } from "@/components/brand-rollup";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { formatCityList } from "@/lib/domain/company-presence";
import { SaveAgencyButton } from "@/components/save-agency-button";
import { SuggestFichaTipForm } from "@/components/suggest-ficha-tip-form";
import { agencyHasPublishedPhone, publicAgencyEmail } from "@/lib/domain/agency-contact";
import { summarizeReviewPatterns } from "@/lib/domain/review-patterns";
import {
  agencyTrustedDomains,
  maskSpanishPhone,
} from "@/lib/domain/claim-verification";
import { agencyService, usingSupabase } from "@/lib/container";
import { cityToSlug } from "@/lib/domain/city";
import { agencyJsonLd, pageMeta } from "@/lib/seo";
import { agencyLogoUrl } from "@/lib/ops/agency-logos";
import { isTwilioConfigured } from "@/lib/services/sms-provider";

function fichaQuery(
  slug: string,
  perspective: "inquilino" | "propietario" | null,
  city: string | null,
) {
  const params = new URLSearchParams();
  if (perspective) params.set("perspectiva", perspective);
  if (city) params.set("ciudad", city);
  const query = params.toString();
  return query ? `/agencias/${slug}?${query}` : `/agencias/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const direct = await agencyService.getBySlug(slug, { publicOnly: true });
  const canonical = direct
    ? slug
    : await agencyService.findCanonicalSlug(slug);
  const agency = direct
    ?? (canonical
      ? await agencyService.getBySlug(canonical, { publicOnly: true })
      : undefined);
  if (!agency) return { title: "Inmobiliaria no encontrada" };
  const reviewHint =
    agency.reviewCount > 0
      ? `${agency.reviewCount} experiencias publicadas`
      : "aún sin experiencias publicadas";
  const cities = agency.presenceCities ?? [agency.city];
  const title = cities.length > 1 ? agency.name : `${agency.name} en ${agency.city}`;
  const description = `Cómo gestionan el alquiler en ${agency.name} (${formatCityList(cities)}): fianzas, reparaciones y comunicación. ${reviewHint}.`;
  return pageMeta(title, description, `/agencias/${agency.slug}`);
}

export default async function AgencyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ perspectiva?: string; ciudad?: string }>;
}) {
  const { slug } = await params;
  const { perspectiva, ciudad } = await searchParams;
  const agency = await agencyService.getBySlug(slug, { publicOnly: true });
  if (!agency) {
    const canonical = await agencyService.findCanonicalSlug(slug);
    if (canonical && canonical !== slug) redirect(`/agencias/${canonical}`);
    notFound();
  }
  const cities = agency.presenceCities ?? [agency.city];
  const cityFilter = ciudad?.trim() || null;
  const brand = await agencyService.brandRollup(agency);

  const perspective =
    perspectiva === "inquilino" || perspectiva === "propietario"
      ? perspectiva
      : null;
  const perspectiveHint =
    perspective === "inquilino"
      ? "Mostrando la nota y las experiencias de inquilinos."
      : perspective === "propietario"
        ? "Mostrando la nota y las experiencias de propietarios."
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
    incidentSentiments: review.incidentSentiments,
    experienceDate: review.experienceDate.toISOString(),
    experienceType: review.experienceType,
    experienceCity: review.experienceCity,
    verificationLevel: review.verificationLevel,
    identityVerification: review.identityVerification,
    createdAt: review.createdAt.toISOString(),
    editedAt: review.editedAt?.toISOString(),
    response: review.response
      ? {
          ...review.response,
          createdAt: review.response.createdAt.toISOString(),
        }
      : undefined,
  }));

  const totalReviews = agency.reviews.length;
  const inquilinoReviews = agency.reviews.filter(
    (review) => review.role === "inquilino",
  ).length;
  const propietarioReviews = agency.reviews.filter(
    (review) => review.role === "propietario",
  ).length;
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
          logoUrl: agencyLogoUrl(agency.logoPath),
        })}
      />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
            <Breadcrumbs
              items={
                cities.length > 1
                  ? [
                      { name: "Registro", href: "/agencias" },
                      { name: agency.name, href: `/agencias/${agency.slug}` },
                    ]
                  : [
                      { name: "Ciudades", href: "/explorar" },
                      {
                        name: agency.city,
                        href: `/ciudades/${cityToSlug(agency.city)}`,
                      },
                      { name: agency.name, href: `/agencias/${agency.slug}` },
                    ]
              }
            />
          <div className="motion-fade-rise mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <AgencyLogo
                name={agency.name}
                src={agencyLogoUrl(agency.logoPath)}
                size="lg"
              />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {agency.name}
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
                {formatCityList(cities)}
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
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
              <a
                href={totalReviews > 0 ? "#experiencias" : "#dejar-resena"}
                className="btn-primary inline-flex min-h-11 w-full items-center justify-center px-6 sm:w-auto"
              >
                {totalReviews > 0 ? "Leer experiencias" : "Dejar la primera reseña"}
              </a>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
                {totalReviews > 0 ? (
                  <a
                    href="#dejar-resena"
                    className="link-brand inline-flex min-h-11 items-center text-sm"
                  >
                    Dejar una reseña
                  </a>
                ) : null}
                <SaveAgencyButton agencyId={agency.id} variant="link" />
              </div>
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
              emphasis={perspective ?? undefined}
              writeHref="#dejar-resena"
            />
          </div>
          <p className="mt-6 text-sm text-zinc-600">
            Las dos notas son de toda la empresa, en todas sus ciudades. Elige un
            lado si quieres leer solo esas experiencias. La ciudad solo cambia
            la lista de abajo.
          </p>
          {brand ? (
            <div className="mt-6">
              <BrandRollup
                brandName={brand.brandName}
                companyCount={brand.companyCount}
                roleRatings={brand.roleRatings}
              />
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link
              href={fichaQuery(slug, null, cityFilter)}
              className={`filter-chip ${perspective ? "filter-chip-idle" : "filter-chip-active"}`}
            >
              Las dos notas ({totalReviews})
            </Link>
            <Link
              href={fichaQuery(slug, "inquilino", cityFilter)}
              className={`filter-chip ${perspective === "inquilino" ? "filter-chip-active" : "filter-chip-idle"}`}
            >
              Solo inquilinos ({inquilinoReviews})
            </Link>
            <Link
              href={fichaQuery(slug, "propietario", cityFilter)}
              className={`filter-chip ${perspective === "propietario" ? "filter-chip-active" : "filter-chip-idle"}`}
            >
              Solo propietarios ({propietarioReviews})
            </Link>
          </div>
          {perspectiveHint ? (
            <p className="mt-3 text-sm font-medium text-zinc-800">
              {perspectiveHint}
            </p>
          ) : null}

          <AgencyReviewPatterns summary={patterns} />

          <AgencyPresence
            agency={agency}
            locations={agency.locations}
            aliases={agency.aliases}
          />

          <IncidentSentimentSummary reviews={agency.reviews} />
          <h2 id="experiencias" className="mt-12 text-xl font-semibold tracking-tight">
            Registro de experiencias
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {totalReviews}{" "}
            {totalReviews === 1
              ? "reseña publicada."
              : "reseñas publicadas."}
            {cityFilter
              ? ` La nota de arriba es de toda la empresa. Abajo, lo contado en ${cityFilter}.`
              : ""}
          </p>
          {cities.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link
                href={fichaQuery(agency.slug, perspective, null)}
                className={`filter-chip ${cityFilter ? "filter-chip-idle" : "filter-chip-active"}`}
              >
                Todas las ciudades
              </Link>
              {cities.map((city) => (
                <Link
                  key={city}
                  href={fichaQuery(agency.slug, perspective, city)}
                  className={`filter-chip ${cityFilter?.toLowerCase() === city.toLowerCase() ? "filter-chip-active" : "filter-chip-idle"}`}
                >
                  {city}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="mt-6">
            <AgencyReviewList
              reviews={reviewsForClient.filter((review) =>
                cityFilter
                  ? review.experienceCity?.toLowerCase() === cityFilter.toLowerCase()
                  : true,
              )}
              initialFilter={perspective ?? undefined}
            />
          </div>
          <div className="mt-10">
            <SuggestFichaTipForm
              agencySlug={agency.slug}
              agencyCity={agency.city}
            />
          </div>
          <div className="mt-6">
            <ClaimForm
              agencyId={agency.id}
              agencyClaimed={agency.claimed}
              agencyPhonePublished={agencyHasPublishedPhone(agency)}
              agencyPhoneHint={maskSpanishPhone(agency.phone)}
              agencyEmailDomainHint={emailDomainHint}
              requiresCif={Boolean(agency.cif)}
              businessSmsEnabled={isTwilioConfigured()}
            />
            <Link
              href={`/agencia/${slug}/panel`}
              className="link-brand mt-3 block text-sm"
            >
              Ya reclamé la ficha: ir al panel
            </Link>
          </div>
        </section>

        <aside className="space-y-6">
          <AgencyMetadataCard agency={agency} aliases={agency.aliases} />
          <div id="dejar-resena">
            <ReviewForm agencySlug={agency.slug} cities={cities} />
          </div>
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
