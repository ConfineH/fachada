import Image from "next/image";

import { cityPhoto } from "@/lib/domain/city-photos";

export function CityPhoto({
  slug,
  city,
  sizes,
  priority = false,
  decorative = false,
}: {
  slug: string;
  city: string;
  sizes: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  const photo = cityPhoto(slug);

  return (
    <div className="pointer-events-none absolute inset-0">
      {photo ? (
        <Image
          src={photo.src}
          alt={decorative ? "" : photo.alt || city}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full bg-stone-400" aria-hidden />
      )}
    </div>
  );
}
