import Link from "next/link";

import { CityPhoto } from "@/components/city-photo";

export function CityDirectoryCard({
  city,
  slug,
  agencyCount,
  reviewCount,
  featured = false,
  size = "tile",
}: {
  city: string;
  slug: string;
  agencyCount: number;
  reviewCount: number;
  featured?: boolean;
  size?: "tile" | "hero";
}) {
  const tall = size === "hero" || featured;

  return (
    <Link
      href={`/ciudades/${slug}`}
      className={`relative block h-full overflow-hidden rounded-xl border border-stone-200 bg-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        tall ? "min-h-[220px] lg:min-h-[320px]" : "min-h-[168px]"
      }`}
    >
      <CityPhoto
        slug={slug}
        city={city}
        decorative
        priority={tall}
        sizes={tall ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 640px) 33vw, 100vw"}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3
          className={`font-semibold tracking-tight ${
            tall ? "text-3xl" : "text-xl"
          }`}
        >
          {city}
        </h3>
        <p className="mt-1 text-sm text-white/80">
          {agencyCount} {agencyCount === 1 ? "agencia" : "agencias"}
          {reviewCount > 0
            ? ` · ${reviewCount} ${reviewCount === 1 ? "reseña" : "reseñas"}`
            : ""}
        </p>
      </div>
    </Link>
  );
}
