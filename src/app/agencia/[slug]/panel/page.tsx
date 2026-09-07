import Link from "next/link";
import { notFound } from "next/navigation";

import { AgencyOwnerPanel } from "@/components/agency-owner-panel";
import { DevBanner } from "@/components/dev-banner";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { SiteNav } from "@/components/site-nav";
import { agencyService, usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Panel inmobiliaria — Fachada",
};

export default async function AgencyPanelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = await agencyService.getBySlug(slug, { publicOnly: false });
  if (!agency) notFound();

  const reviewsForOwner = agency.reviews.map((review) => ({
    id: review.id,
    title: review.title,
    body: review.body,
    response: review.response
      ? {
          body: review.response.body,
          createdAt: review.response.createdAt.toISOString(),
        }
      : undefined,
  }));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <DevBanner storage={usingSupabase() ? "supabase" : "memory"} />
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/agencias/${slug}`}
          className="text-sm text-amber-700 hover:underline"
        >
          ← Volver a la ficha pública
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Panel — {agency.name}</h1>
        <p className="mt-2 text-sm text-stone-600">
          Identifícate con la cuenta del reclamo y responde reseñas. Las
          respuestas se muestran en la ficha cuando la reseña está publicada.
        </p>
        <div className="mt-6">
          <RoleRatingSummary roleRatings={agency.roleRatings} />
        </div>
        <div className="mt-8">
          <AgencyOwnerPanel
            agencySlug={slug}
            agencyVerified={agency.verified}
            website={agency.website}
            googleMapsUrl={agency.googleMapsUrl}
            idealistaUrl={agency.idealistaUrl}
            fotocasaUrl={agency.fotocasaUrl}
            reviews={reviewsForOwner}
          />
        </div>
      </main>
    </div>
  );
}
