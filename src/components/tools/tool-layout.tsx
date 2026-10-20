import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { LegalNotice } from "@/components/tools/legal-notice";
import { ReviewCta } from "@/components/tools/review-cta";
import { TENANT_TOOLS, type ToolDefinition } from "@/lib/domain/tools/catalog";
import { REFORM_2026_NOTE } from "@/lib/domain/tools/constants";
import { faqJsonLd } from "@/lib/seo";

export function ToolLayout({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
}) {
  const related = TENANT_TOOLS.filter((entry) => entry.id !== tool.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <JsonLd data={faqJsonLd(tool.faqs)} />
      <div className="no-print">
        <Breadcrumbs
          items={[
            { name: "Herramientas", href: "/herramientas" },
            { name: tool.label, href: tool.path },
          ]}
        />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Herramienta para inquilinos
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tool.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">{tool.description}</p>
        <div className="mt-6 space-y-3">
          <LegalNotice />
          {REFORM_2026_NOTE ? (
            <p
              role="note"
              className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-700"
            >
              {REFORM_2026_NOTE}
            </p>
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          <a
            href={tool.articleUrl}
            className="link-brand"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tool.articleLabel}
          </a>
          . {tool.articleNote}{" "}
          {tool.extraLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-brand mr-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </p>
      </div>

      <div className="mt-8">{children}</div>

      <div className="no-print mt-14 space-y-10">
        <section>
          <h2 className="text-lg font-semibold">Otras herramientas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {related.map((entry) => (
              <li key={entry.id}>
                <Link href={entry.path} className="link-brand">
                  {entry.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Preguntas frecuentes</h2>
          <dl className="mt-4 space-y-5">
            {tool.faqs.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-zinc-900">{item.question}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-zinc-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
        <ReviewCta />
      </div>
    </main>
  );
}
