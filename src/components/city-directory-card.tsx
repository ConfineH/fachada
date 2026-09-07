import Link from "next/link";

import { scoreTone } from "@/lib/domain/explore";

const toneStyles = {
  positive: "bg-teal-50 text-teal-900 border-teal-100",
  neutral: "bg-sky-50 text-sky-900 border-sky-100",
  caution: "bg-amber-50 text-amber-900 border-amber-100",
} as const;

export function CityDirectoryCard({
  city,
  slug,
  agencyCount,
  reviewCount,
  averageRating,
  featured = false,
}: {
  city: string;
  slug: string;
  agencyCount: number;
  reviewCount: number;
  averageRating: number | null;
  featured?: boolean;
}) {
  const tone = scoreTone(averageRating);
  const scoreLabel =
    averageRating !== null ? `${averageRating.toFixed(1)}/5` : "Sin nota";

  return (
    <Link
      href={`/ciudades/${slug}`}
      className={`card-interactive block p-5 ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
          {city}
        </h3>
        <div
          className={`shrink-0 rounded-lg border px-2.5 py-1 text-right text-xs font-medium ${toneStyles[tone]}`}
        >
          <span className="block text-[10px] uppercase tracking-wide opacity-70">
            Nota media
          </span>
          <span className="text-sm font-semibold tabular-nums">{scoreLabel}</span>
        </div>
      </div>
      {featured && (
        <div
          className="mt-4 h-28 rounded-lg border border-zinc-100 bg-gradient-to-br from-zinc-100 via-zinc-50 to-teal-50"
          aria-hidden
        />
      )}
      <p className="mt-4 text-sm text-zinc-600">
        <span className="font-medium text-zinc-800">{agencyCount}</span>{" "}
        {agencyCount === 1 ? "agencia registrada" : "agencias registradas"}
        {reviewCount > 0 && (
          <>
            {" "}
            ·{" "}
            <span className="text-zinc-500">
              {reviewCount} {reviewCount === 1 ? "reseña" : "reseñas"}
            </span>
          </>
        )}
      </p>
    </Link>
  );
}
