import type { AgencyRoleRatings } from "@/lib/domain/ratings";

import { StarScore } from "@/components/star-score";

export function RoleRatingSummary({
  roleRatings,
  variant = "default",
  emphasis,
  writeHref,
}: {
  roleRatings: AgencyRoleRatings;
  variant?: "default" | "profile";
  emphasis?: "inquilino" | "propietario";
  writeHref?: string;
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
        role="inquilino"
        summary={roleRatings.inquilino}
        hint="A partir de experiencias de alquiler."
        variant={variant}
        emphasis={emphasis}
        writeHref={writeHref}
      />
      <RatingCard
        title="Propietarios"
        role="propietario"
        summary={roleRatings.propietario}
        hint="A partir de experiencias de propietarios."
        variant={variant}
        emphasis={emphasis}
        writeHref={writeHref}
      />
    </div>
  );
}

function RatingCard({
  title,
  role,
  summary,
  hint,
  variant,
  emphasis,
  writeHref,
}: {
  title: string;
  role: "inquilino" | "propietario";
  summary: { averageRating: number; reviewCount: number };
  hint: string;
  variant: "default" | "profile";
  emphasis?: "inquilino" | "propietario";
  writeHref?: string;
}) {
  const score =
    summary.reviewCount > 0 ? Number(summary.averageRating.toFixed(1)) : null;
  const focused = emphasis === role;
  const dimmed = emphasis !== undefined && !focused;
  const shell =
    variant === "profile"
      ? "card-raised p-5"
      : "rounded-xl border border-stone-200 bg-white p-4";

  return (
    <div
      className={`${shell} ${focused ? "ring-2 ring-zinc-900" : ""} ${dimmed ? "opacity-50" : ""}`}
    >
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      {variant === "profile" && score !== null ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <ScoreValue score={score} className="" />
          <StarScore score={score} size="lg" />
        </div>
      ) : (
        <>
          <ScoreValue score={score} />
          {score !== null ? (
            <div className="mt-2">
              <StarScore score={score} size="md" />
            </div>
          ) : null}
        </>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        {summary.reviewCount}{" "}
        {summary.reviewCount === 1 ? "experiencia" : "experiencias"} · {hint}
      </p>
      {score === null && writeHref ? (
        <a href={writeHref} className="link-brand mt-3 inline-block text-xs">
          Dejar la primera experiencia de {role === "inquilino" ? "inquilino" : "propietario"}
        </a>
      ) : null}
    </div>
  );
}

function ScoreValue({
  score,
  className = "mt-2",
}: {
  score: number | null;
  className?: string;
}) {
  return (
    <p
      className={`${className} text-3xl font-semibold tabular-nums tracking-tight text-zinc-900`}
    >
      {score !== null ? score.toFixed(1) : "—"}
      {score !== null ? <span className="sr-only"> de 5</span> : null}
    </p>
  );
}
