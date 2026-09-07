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
        hint="Basado en experiencias de alquiler."
        variant={variant}
      />
      <RatingCard
        title="Propietarios"
        summary={roleRatings.propietario}
        hint="Basado en mandatos de gestión."
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
  const score = summary.reviewCount > 0 ? summary.averageRating : null;
  const fillPercent = score !== null ? (score / 5) * 100 : 0;

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
      </p>
      <p className="text-xs text-zinc-500">
        {summary.reviewCount}{" "}
        {summary.reviewCount === 1 ? "experiencia" : "experiencias"} · {hint}
      </p>
      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100"
        role="presentation"
      >
        <div
          className="motion-bar-fill h-full rounded-full bg-brand"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}
