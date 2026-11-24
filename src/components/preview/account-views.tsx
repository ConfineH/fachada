import { PREVIEW_ACCOUNT, agencyById } from "@/lib/preview/fixtures";
import { cityLabel } from "@/lib/preview/reviews";
import type { AccountStatus } from "@/lib/preview/fixtures";
import type { PreviewController } from "@/components/preview/state";
import {
  CurrentFooter,
  CurrentNav,
  FictionMark,
  ProposedFooter,
  ProposedNav,
} from "@/components/preview/ui";

const CURRENT_STATUS: Record<AccountStatus, string> = {
  publicada: "publicada",
  pendiente: "pendiente de moderación",
  retirada: "retirada",
};

const PROPOSED_STATUS: Record<AccountStatus, string> = {
  publicada: "Se lee en la ficha.",
  pendiente: "Todavía no se lee. Está en revisión.",
  retirada: "Ya no se lee. Puedes pedir que se revise la retirada.",
};

export function CurrentAccount({ state }: { state: PreviewController }) {
  return (
    <div>
      <CurrentNav go={state.go} />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Tu cuenta</h1>
          <p className="mt-2 text-sm text-zinc-600">Sesión de ejemplo. El correo no se publica en las fichas.</p>
        </header>
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium">Tus reseñas</h2>
          <ul className="mt-4 space-y-4">
            {PREVIEW_ACCOUNT.map((item) => (
              <li key={item.id} className="border-t border-stone-100 pt-4 first:border-0 first:pt-0">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  <button type="button" className="link-brand" onClick={() => state.openFicha(item.agencyId)}>
                    {agencyById(item.agencyId).name}
                  </button>
                  {" · "}
                  {item.rating}/5 · {CURRENT_STATUS[item.status]}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium">Tus datos y derechos</h2>
          <p className="mt-2 text-sm text-zinc-600">Exportar y solicitar un derecho aparecen antes que las fichas guardadas.</p>
        </section>
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium">Inmobiliarias guardadas</h2>
          <p className="mt-3 text-sm">
            <FictionMark /> Alba Gestión · Madrid
          </p>
        </section>
      </main>
      <CurrentFooter />
    </div>
  );
}

export function ProposedAccount({ state }: { state: PreviewController }) {
  return (
    <div>
      <ProposedNav go={state.go} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Tu cuenta</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Sesión de ejemplo. El correo identifica la cuenta y no sale en la ficha.
        </p>
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Lo que has escrito</h2>
          <ul className="mt-4 space-y-4">
            {PREVIEW_ACCOUNT.map((item) => {
              const agency = agencyById(item.agencyId);
              return (
                <li key={item.id} className="rounded-xl border border-stone-200 bg-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <FictionMark />
                    <p className="text-sm font-medium text-zinc-800">{PROPOSED_STATUS[item.status]}</p>
                  </div>
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    {agency.name} · {item.role === "inquilino" ? "Inquilino" : "Propietario"} · {item.rating}/5 · {cityLabel(item.experienceCity)}
                  </p>
                  {item.status === "publicada" ? (
                    <button type="button" className="link-brand mt-3 text-sm" onClick={() => state.openFicha(item.agencyId)}>
                      Verla en la ficha
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium">Inmobiliarias guardadas</h2>
          <button type="button" className="link-brand mt-3 text-sm" onClick={() => state.openFicha("alba")}>
            Alba Gestión · Madrid
          </button>
        </section>
        <details className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
          <summary className="cursor-pointer text-sm font-medium">Datos y derechos</summary>
          <p className="mt-3 text-sm text-zinc-600">
            Exportar una copia y solicitar acceso, rectificación o supresión siguen disponibles, fuera de la lista de reseñas.
          </p>
        </details>
      </main>
      <ProposedFooter />
    </div>
  );
}
