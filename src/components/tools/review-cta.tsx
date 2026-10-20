import Link from "next/link";

import { REVIEW_CTA } from "@/lib/domain/tools/copy";

export function ReviewCta() {
  return (
    <section className="rounded-xl bg-brand px-6 py-8 text-white">
      <h2 className="text-xl font-semibold tracking-tight">
        <Link
          href="/agencias"
          className="underline decoration-white/40 underline-offset-4 hover:decoration-white"
        >
          {REVIEW_CTA}
        </Link>
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300">
        Busca la inmobiliaria. En su ficha, el formulario es «Escribir reseña».
      </p>
      <form action="/agencias" method="get" className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="tool-agency-search">
          Nombre de la agencia
        </label>
        <input
          id="tool-agency-search"
          name="q"
          type="search"
          placeholder="Nombre de la agencia"
          className="input-field min-h-11 flex-1"
        />
        <button
          type="submit"
          className="btn-primary min-h-11 bg-white text-zinc-900 hover:bg-zinc-100"
        >
          Buscar la agencia
        </button>
      </form>
    </section>
  );
}
