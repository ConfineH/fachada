import Link from "next/link";
import { Source_Serif_4 } from "next/font/google";
import { redirect } from "next/navigation";

import { HomeSearch } from "@/components/home-search";
import { DevBanner } from "@/components/dev-banner";
import { FachadaMark } from "@/components/fachada-mark";
import { JsonLd } from "@/components/json-ld";
import { homeDocumentedAgencies } from "@/lib/domain/agency-browse";
import { publicPresenceLine } from "@/lib/domain/company-presence";
import { HOME_PAGE_FAQS, selectHomeExcerpts } from "@/lib/domain/home-page";
import type { RoleRatingSummary } from "@/lib/domain/ratings";
import { agencyService, usingSupabase } from "@/lib/container";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SHARE_DESCRIPTION,
  SITE_NAME,
  faqJsonLd,
  organizationJsonLd,
  pageMeta,
  websiteJsonLd,
} from "@/lib/seo";

import styles from "./home.module.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archive-serif",
});

export const metadata = {
  ...pageMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION, "/", SHARE_DESCRIPTION),
  title: { absolute: `${DEFAULT_TITLE} · ${SITE_NAME}` },
};

function scoreText(summary: RoleRatingSummary) {
  return summary.averageRating.toLocaleString("es-ES", {
    minimumFractionDigits: Number.isInteger(summary.averageRating) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function Score({
  label,
  summary,
}: {
  label: string;
  summary: RoleRatingSummary;
}) {
  const single = summary.reviewCount === 1;

  return (
    <div className={styles.score}>
      <span className={styles.cellLabel}>{label}</span>
      {summary.reviewCount > 0 ? (
        <>
          <span className={styles.figure}>
            {scoreText(summary)}
            <span className={styles.outOf}> sobre 5</span>
          </span>
          <span className={styles.sample}>
            {single
              ? "Una opinión"
              : `${summary.reviewCount.toLocaleString("es-ES")} opiniones`}
          </span>
        </>
      ) : (
        <span className={styles.empty}>Sin opiniones</span>
      )}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  if (q?.trim()) {
    const params = new URLSearchParams({ q: q.trim() });
    redirect(`/inquilinos?${params.toString()}`);
  }

  const [agencies, cities] = await Promise.all([
    agencyService.search(undefined, { publicOnly: true }),
    agencyService.exploreCities({ publicOnly: true }),
  ]);
  const documented = homeDocumentedAgencies(agencies);
  const opened = await Promise.all(
    documented.preview.map((agency) =>
      agencyService.getBySlug(agency.slug, { publicOnly: true }),
    ),
  );
  const shownExcerpts = selectHomeExcerpts(
    opened.flatMap((agency) => (agency ? [agency] : [])),
  );
  const cityLinks = cities
    .filter((city) => city.agencyCount > 0)
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city, "es"));
  const year = new Date().getFullYear();

  return (
    <div className={`${styles.page} ${sourceSerif.variable}`}>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd([...HOME_PAGE_FAQS])} />
      <DevBanner storage={usingSupabase() ? "supabase" : "memory"} />
      <a className={styles.skip} href="#contenido">
        Saltar al contenido
      </a>
      <header className={styles.mast}>
        <div className={`${styles.wrap} ${styles.mastInner}`}>
          <Link href="/" className={styles.brand}>
            <FachadaMark className="h-7 w-auto shrink-0" />
            FACHADA
          </Link>
          <nav className={styles.nav} aria-label="Secciones">
            <a href="#fichas">Archivo</a>
            <Link href="/metodologia">Metodología</Link>
            <Link href="/herramientas">Herramientas</Link>
            <Link href="/cuenta">Cuenta</Link>
          </nav>
        </div>
      </header>

      <main id="contenido">
        <section className={styles.hero}>
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div>
              <h1 className={styles.h1}>
                Antes de firmar, mira la reputación de esa inmobiliaria
              </h1>
              <p className={styles.lead}>
                Experiencias de inquilinos y propietarios sobre la gestión:
                fianza, reparaciones, honorarios. No sobre el piso.
              </p>
              <HomeSearch />
              <Link className={`${styles.quiet} ${styles.heroLink}`} href="/inquilinos">
                Buscar la inmobiliaria
              </Link>
              {cityLinks.length > 0 ? (
                <nav className={styles.cities} aria-label="Ciudades">
                  <span className={styles.kicker}>Ciudades</span>
                  <span className={styles.cityList}>
                    {cityLinks.map((city) => (
                      <Link key={city.slug} href={`/ciudades/${city.slug}`}>
                        {city.city}
                      </Link>
                    ))}
                  </span>
                </nav>
              ) : null}
            </div>
            {shownExcerpts.length > 0 ? (
              <aside className={styles.aside} aria-label="Opiniones publicadas">
                <p className={styles.kicker}>Opiniones publicadas</p>
                <ul className={styles.excerpts}>
                  {shownExcerpts.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/agencias/${item.slug}`}>
                        <p className={styles.quote}>{item.text}</p>
                        <span className={styles.meta}>
                          {`${item.name} · una opinión de ${item.role}, ${item.rating.toLocaleString("es-ES")} sobre 5`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </section>

        <section className={styles.section} id="fichas" aria-labelledby="fichas-title">
          <div className={styles.wrap}>
            <h2 className={styles.h2} id="fichas-title">
              Fichas con experiencias
            </h2>
            <p className={styles.prose}>
              {documented.total > 0
                ? "Cada número es la nota de esas opiniones. Con una sola, no es la reputación de la inmobiliaria."
                : "Cuando haya experiencias publicadas, cada ficha mostrará por separado la opinión de inquilinos y la de propietarios."}
            </p>
            {documented.preview.length > 0 ? (
              <div className={styles.ledger}>
                <div className={styles.ledgerHead} aria-hidden="true">
                  <span>Inmobiliaria</span>
                  <span>Inquilinos</span>
                  <span>Propietarios</span>
                </div>
                {documented.preview.map((agency) => {
                  const places = agency.presenceCities ?? [agency.city];
                  return (
                    <Link
                      key={agency.id}
                      href={`/agencias/${agency.slug}`}
                      className={styles.row}
                    >
                      <span className={styles.identity}>
                        <span className={styles.name}>{agency.name}</span>
                        <span className={styles.place}>
                          {publicPresenceLine(agency, places)}
                        </span>
                      </span>
                      <span className={styles.scores}>
                        <Score
                          label="Inquilinos"
                          summary={agency.roleRatings.inquilino}
                        />
                        <Score
                          label="Propietarios"
                          summary={agency.roleRatings.propietario}
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className={styles.prose}>Todavía no hay experiencias publicadas.</p>
            )}
            <p className={styles.more}>
              <Link className={styles.quiet} href="/agencias">
                {documented.hidden > 0
                  ? `Ver las ${documented.total.toLocaleString("es-ES")} fichas`
                  : "Ver el registro"}
              </Link>
            </p>
          </div>
        </section>

        <section className={styles.section} id="participar" aria-labelledby="participar-title">
          <div className={styles.wrap}>
            <h2 className={styles.h2} id="participar-title">
              Cuéntalo en la ficha
            </h2>
            <p className={styles.prose}>
              Para publicar, busca primero la inmobiliaria y escribe después
              en su ficha. Si todavía no existe, puedes proponer el alta. El
              correo identifica la cuenta y no se muestra.
            </p>
            <div className={styles.actions}>
              <Link className={styles.btn} href="/inquilinos">
                Buscar la inmobiliaria
              </Link>
              <Link className={styles.textAction} href="/agregar-inmobiliaria">
                Sugerir una inmobiliaria
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="como-title">
          <div className={styles.wrap}>
            <h2 className={styles.h2} id="como-title">
              Cómo funciona
            </h2>
            <p className={styles.prose}>
              Se consulta la ficha de la inmobiliaria, no la del piso. Con el
              correo verificado, el texto se publica como experiencia
              declarada. Solo pasa a acreditada si una persona revisa pruebas.
            </p>
            <p className={styles.more}>
              <Link className={styles.quiet} href="/metodologia">
                Cómo publicamos una reseña
              </Link>
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-title">
          <div className={styles.wrap}>
            <h2 className={styles.h2} id="faq-title">
              Preguntas sobre el archivo
            </h2>
            <dl className={styles.faq}>
              {HOME_PAGE_FAQS.map((item) => (
                <div className={styles.faqItem} key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
            <nav className={styles.docs} aria-label="Documentos">
              <Link href="/explorar">Directorio por ciudad</Link>
              <Link href="/agencias">Registro completo</Link>
              <Link href="/inquilinos">Buscar y publicar</Link>
              <Link href="/metodologia">Metodología</Link>
              <Link href="/sobre">Sobre Fachada</Link>
              <Link href="/herramientas">Calculadoras de alquiler</Link>
              <Link href="/agencia/acceso">Acceso para agencias</Link>
              <Link href="/legal/aviso-legal">Aviso legal</Link>
              <Link href="/legal/privacidad">Privacidad</Link>
              <Link href="/legal/cookies">Cookies</Link>
              <Link href="/legal/normas">Normas de uso</Link>
            </nav>
          </div>
        </section>
      </main>
      <footer>
        <div className={`${styles.wrap} ${styles.colophon}`}>
          <p>© {year} Fachada. Archivo independiente.</p>
        </div>
      </footer>
    </div>
  );
}
