import type { ReviewPatternSummary } from "@/lib/domain/review-patterns";

function PatternList({
  title,
  items,
  tone,
}: {
  title: string;
  items: ReviewPatternSummary["positives"];
  tone: "positive" | "negative";
}) {
  if (items.length === 0) return null;
  const box =
    tone === "positive"
      ? "border-teal-100 bg-teal-50/70"
      : "border-amber-100 bg-amber-50/70";
  const countColor =
    tone === "positive" ? "text-teal-800" : "text-amber-900";

  return (
    <div className={`rounded-xl border p-4 ${box}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {title}
      </h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={`${item.kind}-${item.text}`}>
            <p className="text-sm font-medium text-zinc-900">{item.text}</p>
            <p className={`mt-0.5 text-xs ${countColor}`}>
              En {item.count} {item.count === 1 ? "reseña" : "reseñas"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgencyReviewPatterns({
  summary,
}: {
  summary: ReviewPatternSummary;
}) {
  if (summary.positives.length === 0 && summary.negatives.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">
        Lo que más se repite
      </h2>
      <p className="mt-1 text-sm text-zinc-600">
        Lo que coincide en más de una reseña. No sustituye leerlas.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PatternList
          title="A favor"
          items={summary.positives}
          tone="positive"
        />
        <PatternList
          title="En contra"
          items={summary.negatives}
          tone="negative"
        />
      </div>
    </section>
  );
}
