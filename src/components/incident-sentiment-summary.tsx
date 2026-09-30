import {
  summarizeIncidentSentiments,
  type IncidentSentiments,
} from "@/lib/domain/incidents";

export function IncidentSentimentSummary({
  reviews,
}: {
  reviews: { incidentSentiments?: IncidentSentiments }[];
}) {
  const themes = summarizeIncidentSentiments(reviews);
  if (themes.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">Por temas</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Lo que la gente marcó como bien o mal. No sustituye leer la experiencia.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {themes.map((theme) => {
          const total = theme.positiva + theme.negativa;
          const positiveShare = Math.round((theme.positiva / total) * 100);
          return (
            <li
              key={theme.tag}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3"
            >
              <p className="text-sm font-medium text-zinc-900">{theme.label}</p>
              <p className="mt-1 text-sm text-zinc-700">
                {positiveShare}% positivo · {theme.positiva} bien · {theme.negativa} mal
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
