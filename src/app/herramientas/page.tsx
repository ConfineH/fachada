import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { LegalNotice } from "@/components/tools/legal-notice";
import { ReviewCta } from "@/components/tools/review-cta";
import { TENANT_TOOLS, TOOLS_INDEX } from "@/lib/domain/tools/catalog";
import { REFORM_2026_NOTE } from "@/lib/domain/tools/constants";
import { faqJsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta(TOOLS_INDEX.title, TOOLS_INDEX.description, "/herramientas");

export default function HerramientasPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <JsonLd data={faqJsonLd([...TOOLS_INDEX.faqs])} />
      <Breadcrumbs items={[{ name: "Herramientas", href: "/herramientas" }]} />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Para el momento del problema
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
        {TOOLS_INDEX.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
        Cuatro cálculos sobre el alquiler de vivienda. Sirven cuando ya hay un cobro, una fianza,
        una avería o una salida. Al terminar, puedes contar qué pasó con la agencia.
      </p>
      <div className="mt-6 max-w-3xl space-y-3">
        <LegalNotice />
        {REFORM_2026_NOTE ? (
          <p role="note" className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-700">
            {REFORM_2026_NOTE}
          </p>
        ) : null}
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {TENANT_TOOLS.map((tool) => (
          <li key={tool.id}>
            <Link href={tool.path} className="card-interactive block h-full p-6">
              <h2 className="text-xl font-semibold tracking-tight">{tool.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{tool.card}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-14 max-w-3xl">
        <h2 className="text-lg font-semibold">Preguntas frecuentes</h2>
        <dl className="mt-4 space-y-5">
          {TOOLS_INDEX.faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-zinc-900">{item.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-zinc-600">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="mt-14 max-w-3xl">
        <ReviewCta />
      </div>
    </main>
  );
}
