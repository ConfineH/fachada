import { FachadaMark } from "@/components/fachada-mark";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { StarScore } from "@/components/star-score";
import { reviewsForAgency, type PreviewReview } from "@/lib/preview/fixtures";
import { cityLabel, roleRatingsFor } from "@/lib/preview/reviews";
import type { PreviewScreen } from "@/components/preview/state";

export function FictionMark() {
  return <span className="badge-warning">Ficticio</span>;
}

export function DualScores({ agencyId }: { agencyId: string }) {
  return (
    <RoleRatingSummary
      roleRatings={roleRatingsFor(reviewsForAgency(agencyId))}
      variant="profile"
    />
  );
}

export function ReviewExcerpt({
  review,
  onOpen,
}: {
  review: PreviewReview;
  onOpen?: () => void;
}) {
  const body = (
    <>
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-900">
        <span>
          {review.role === "inquilino" ? "Inquilino" : "Propietario"} · {review.createdLabel}
        </span>
        <StarScore score={review.rating} size="sm" tone="neutral" />
        <span className="sr-only">{review.rating} de 5</span>
      </p>
      <p className="mt-1 text-sm text-zinc-500">{cityLabel(review.experienceCity)}</p>
      <p className="mt-2 font-medium text-zinc-900">{review.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-700">{review.body}</p>
    </>
  );
  if (!onOpen) return <article className="rounded-lg border border-stone-200 bg-stone-50 p-4">{body}</article>;
  return (
    <button type="button" onClick={onOpen} className="card-interactive block w-full p-4 text-left">
      {body}
    </button>
  );
}

export function ProposedNav({
  go,
}: {
  go: (screen: PreviewScreen) => void;
}) {
  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => go("home")}
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-zinc-900"
        >
          <FachadaMark className="h-7 w-auto shrink-0" />
          FACHADA
        </button>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button type="button" className="nav-link min-h-11" onClick={() => go("buscar")}>
            Buscar
          </button>
          <button type="button" className="nav-link min-h-11" onClick={() => go("publicar")}>
            Contar experiencia
          </button>
        </div>
        <button
          type="button"
          className="btn-secondary ml-auto min-h-11 px-3"
          onClick={() => go("cuenta")}
        >
          Cuenta
        </button>
      </div>
    </nav>
  );
}

export function CurrentNav({ go }: { go: (screen: PreviewScreen) => void }) {
  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
        <button
          type="button"
          onClick={() => go("home")}
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-zinc-900"
        >
          <FachadaMark className="h-7 w-auto shrink-0" />
          FACHADA
        </button>
        <div className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2 lg:col-span-1 lg:justify-center">
          <button type="button" className="nav-link min-h-11" onClick={() => go("buscar")}>
            Explorar ciudades
          </button>
          <button type="button" className="nav-link min-h-11" onClick={() => go("buscar")}>
            Inmobiliarias
          </button>
          <span className="nav-link min-h-11 cursor-default">Herramientas</span>
          <span className="nav-link min-h-11 cursor-default">Sugerir inmobiliaria</span>
        </div>
        <div className="flex items-center justify-end gap-3 lg:col-start-3">
          <span className="btn-secondary hidden min-h-11 cursor-default sm:inline-flex">
            Acceso para agencias
          </span>
          <button type="button" className="btn-secondary min-h-11 px-3" onClick={() => go("cuenta")}>
            Cuenta
          </button>
        </div>
      </div>
    </nav>
  );
}

export function ProposedFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-4 py-8 text-sm text-zinc-600 sm:px-6">
        <span>Cómo publicamos una reseña</span>
        <span>Calculadoras</span>
        <span>Acceso para agencias</span>
        <span>Sugerir una ficha</span>
        <span>Aviso legal</span>
      </div>
    </footer>
  );
}

export function CurrentFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-zinc-600 sm:grid-cols-3 sm:px-6">
        <p>Archivo independiente de reputación de inmobiliarias.</p>
        <p>Sobre Fachada · Cómo publicamos · Calculadoras</p>
        <p>Aviso legal · Privacidad · Cookies · Normas</p>
      </div>
    </footer>
  );
}
