import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { ReviewForm } from "@/components/review-form";
import { promoQuery, readUtmValue } from "@/lib/domain/promo-utm";
import { usingSupabase } from "@/lib/container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Añadir inmobiliaria y reseña",
  "Si la inmobiliaria no está en Fachada, puedes crear una ficha provisional y publicar tu experiencia.",
  "/inquilinos/anadir",
);

export default async function AnadirInmobiliariaPage({
  searchParams,
}: {
  searchParams: Promise<{
    nombre?: string;
    ciudad?: string;
    direccion?: string;
    utm_source?: string;
    utm_campaign?: string;
  }>;
}) {
  const params = await searchParams;
  const utm = {
    source: readUtmValue(params.utm_source),
    campaign: readUtmValue(params.utm_campaign),
  };
  const back = `/inquilinos${promoQuery(utm)}`;

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <Link href={back} className="link-brand text-sm">
          ← Volver a la búsqueda
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Añádela y escribe tu reseña
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Hace falta el nombre y la ciudad. La dirección es opcional. La ficha
          se publica al momento como provisional, pendiente de verificar, y la
          reseña sale si el texto pasa el filtro y el correo está verificado.
        </p>
        <div className="mt-6">
          <ReviewForm
            agencySlug=""
            unlisted={{
              name: params.nombre?.trim() ?? "",
              city: params.ciudad?.trim() ?? "",
              address: params.direccion?.trim() ?? "",
            }}
            utmQuery={promoQuery(utm)}
          />
        </div>
      </main>
    </PublicShell>
  );
}
