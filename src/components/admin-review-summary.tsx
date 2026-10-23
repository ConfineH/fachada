import type {
  ReviewFunnel,
  ReviewOriginCount,
} from "@/lib/domain/review-funnel";
import { hasPublicContact } from "@/lib/legal";
import { isResendConfigured } from "@/lib/services/email-provider";

const FIGURES: Array<{ key: keyof ReviewFunnel; label: string }> = [
  { key: "submitted", label: "Enviadas" },
  { key: "pending", label: "Pendientes" },
  { key: "published", label: "Publicadas" },
  { key: "flagged", label: "Marcadas" },
  { key: "agenciesWithPublishedReview", label: "Fichas con reseña publicada" },
];

export function AdminReviewSummary({
  funnel,
  origins,
}: {
  funnel: ReviewFunnel;
  origins: ReviewOriginCount[];
}) {
  const mailReady = hasPublicContact() && isResendConfigured();
  return (
    <section>
      <h2 className="text-lg font-medium">Cómo van las reseñas</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Enviadas son todas las que no se han borrado. Pendientes esperan
        decisión. Publicadas ya salen en la ficha. Marcadas son las que
        retuviste: no se publican.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {FIGURES.map((figure) => (
          <li
            key={figure.key}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3"
          >
            <p className="text-2xl font-semibold tracking-tight">
              {funnel[figure.key]}
            </p>
            <p className="mt-1 text-sm text-zinc-600">{figure.label}</p>
          </li>
        ))}
      </ul>
      <table className="mt-6 w-full max-w-md text-sm">
        <caption className="mb-2 text-left font-medium text-zinc-900">
          Según la calculadora de origen
        </caption>
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="py-1 pr-4 font-medium">Calculadora</th>
            <th className="py-1 pr-4 font-medium">Enviadas</th>
            <th className="py-1 font-medium">Publicadas</th>
          </tr>
        </thead>
        <tbody>
          {origins.map((row) => (
            <tr key={row.origen} className="border-t border-stone-200">
              <td className="py-1.5 pr-4">{row.label}</td>
              <td className="py-1.5 pr-4">{row.submitted}</td>
              <td className="py-1.5">{row.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {mailReady ? null : (
        <p className="mt-3 text-sm text-amber-800">
          El aviso por correo no está activo. Hacen falta LEGAL_CONTACT_EMAIL,
          RESEND_API_KEY y EMAIL_FROM.
        </p>
      )}
    </section>
  );
}
