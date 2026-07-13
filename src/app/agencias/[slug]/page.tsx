import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewForm } from "@/components/review-form";
import { agencyService } from "@/lib/container";

export default async function AgencyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = agencyService.getBySlug(slug);
  if (!agency) notFound();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link href="/" className="text-sm text-amber-700 hover:underline">
            ← Volver al buscador
          </Link>
          <h1 className="mt-3 text-3xl font-semibold">{agency.name}</h1>
          <p className="mt-1 text-stone-600">
            {agency.address}, {agency.city} {agency.postalCode}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>Tel: {agency.phone}</span>
            <span>Email: {agency.email}</span>
            {agency.verified && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                Verificada
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[2fr_1fr]">
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-medium">Reseñas</h2>
              <p className="text-sm text-stone-600">
                {agency.reviewCount} opiniones · Media{" "}
                {agency.reviewCount > 0
                  ? agency.averageRating.toFixed(1)
                  : "sin valorar"}
              </p>
            </div>
          </div>

          <ul className="space-y-4">
            {agency.reviews.length === 0 && (
              <li className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-stone-600">
                Aún no hay reseñas. Sé el primero en compartir tu experiencia.
              </li>
            )}
            {agency.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-stone-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize">{review.role}</p>
                  <p className="text-amber-700">{review.rating}/5</p>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{review.title}</h3>
                <p className="mt-2 text-stone-700">{review.body}</p>
                <p className="mt-3 text-xs text-stone-500">
                  {review.createdAt.toLocaleDateString("es-ES")}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-6">
          <ReviewForm agencyId={agency.id} />
          <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
            <h3 className="font-medium text-stone-900">¿Eres esta inmobiliaria?</h3>
            <p className="mt-2">
              Reclama tu perfil para responder a reseñas y verificar tu
              información de contacto.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
