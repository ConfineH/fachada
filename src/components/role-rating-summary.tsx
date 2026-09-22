import type { AgencyRoleRatings } from "@/lib/domain/ratings";

export function RoleRatingSummary({
  roleRatings,
  variant = "default",
}: {
  roleRatings: AgencyRoleRatings;
  variant?: "default" | "profile";
}) {
  return (
    <div
      className={
        variant === "profile"
          ? "grid gap-4 sm:grid-cols-2"
          : "grid gap-3 sm:grid-cols-2"
      }
    >
      <RatingCard
        title="Inquilinos"
        summary={roleRatings.inquilino}
        hint="A partir de experiencias de alquiler."
        variant={variant}
      />
      <RatingCard
        title="Propietarios"
        summary={roleRatings.propietario}
        hint="A partir de experiencias de propietarios."
        variant={variant}
      />
    </div>
  );
}

function RatingCard({
  title,
  summary,
  hint,
  variant,
}: {
  title: string;
  summary: { averageRating: number; reviewCount: number };
  hint: string;
  variant: "default" | "profile";
}) {
  const score =
    summary.reviewCount > 0 ? Number(summary.averageRating.toFixed(1)) : null;

  return (
    <div
      className={
        variant === "profile"
          ? "card-raised p-5"
          : "rounded-xl border border-stone-200 bg-white p-4"
      }
    >
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
        {score !== null ? score.toFixed(1) : "—"}
        {score !== null ? <span className="sr-only"> de 5</span> : null}
      </p>
      {score !== null ? <StarScore score={score} variant={variant} /> : null}
      <p className="mt-2 text-xs text-zinc-500">
        {summary.reviewCount}{" "}
        {summary.reviewCount === 1 ? "experiencia" : "experiencias"} · {hint}
      </p>
    </div>
  );
}

function StarScore({
  score,
  variant,
}: {
  score: number;
  variant: "default" | "profile";
}) {
  const slotClass = variant === "profile" ? "size-5" : "size-3.5";

  return (
    <div
      className={`mt-2 flex flex-nowrap ${variant === "profile" ? "gap-1" : "gap-0.5"}`}
      aria-hidden="true"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarSlot
          key={index}
          fill={Math.min(1, Math.max(0, score - index))}
          slotClass={slotClass}
        />
      ))}
    </div>
  );
}

function StarSlot({
  fill,
  slotClass,
}: {
  fill: number;
  slotClass: string;
}) {
  const amount = Math.round(fill * 1000) / 1000;

  return (
    <span className={`relative block shrink-0 ${slotClass}`} data-fill={amount}>
      <StarIcon className="size-full text-stone-300" />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${amount * 100}%` }}
      >
        <StarIcon className={`absolute top-0 left-0 ${slotClass} text-rating`} />
      </span>
    </span>
  );
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
