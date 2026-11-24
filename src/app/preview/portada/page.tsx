import Link from "next/link";

import { FachadaMark } from "@/components/fachada-mark";
import { homeDocumentedAgencies } from "@/lib/domain/agency-browse";
import { publicPresenceLine } from "@/lib/domain/company-presence";
import type { RoleRatingSummary } from "@/lib/domain/ratings";
import type { UserRole } from "@/lib/domain/types";
import { agencyService } from "@/lib/container";

import { ArchiveSearch } from "./archive-search";
import styles from "./portada.module.css";

const FAQ = [
  {
    question: "¿Fachada verifica que la experiencia ocurrió?",
    answer:
      "No de forma automática. Con el correo verificado se publica como experiencia declarada. Acreditada, solo si una persona revisa pruebas.",
  },
  {
    question: "¿Puede una inmobiliaria borrar una reseña negativa?",
    answer:
      "No. Puede responder, no eliminar la opinión. Una crítica no se retira por ser negativa, por petición especial ni por pago. Sí puede restringirse si incumple las normas, es ilícita o falsa, o vulnera derechos. Si se restringe, se comunica la regla y el motivo.",
  },
] as const;

const LITERAL_PASSAGES = [
  "todo lo relativo a mantenimiento, problemas con cobros y demás asuntos que atañen a la inmobiliaria o agencia gestora fueron mal gestionados.",
  "Si hay algún arreglo a realizar no suelen tardar en exceso (aunque tampoco es que lo vayan a tener para mañana).",
];

function literalPassage(parts: Array<string | undefined>) {
  const sources = parts.filter((part): part is string => Boolean(part?.trim()));
  return LITERAL_PASSAGES.find((passage) =>
    sources.some((source) => source.includes(passage)),
  );
}

function roleName(role: UserRole) {
  return role === "propietario" ? "propietario" : "inquilino";
}

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
            {single ? "Una opinión" : `${summary.reviewCount.toLocaleString("es-ES")} opiniones`}
          </span>
        </>
      ) : (
        <span className={styles.empty}>Sin opiniones</span>
      )}
    </div>
  );
}

export default async function PortadaPreviewPage() {
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
  const excerpts = opened
    .flatMap((agency) => {
      const review = agency?.reviews
        .slice()
        .sort((a, b) => a.rating - b.rating)[0];
      const text = literalPassage([review?.body, review?.pros, review?.cons]);
      if (!agency || !review || !text) return [];
      return [
        {
          slug: agency.slug,
          name: agency.name,
          role: roleName(review.role),
          rating: review.rating,
          text,
        },
      ];
    })
    .sort((a, b) => a.rating - b.rating || a.name.localeCompare(b.name, "es"));
  const cityLinks = cities
    .filter((city) => city.agencyCount > 0)
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city, "es"));
  const year = new Date().getFullYear();

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#contenido">
        Saltar al contenido
      </a>
      <div className={styles.notice}>
        <div className={styles.noticeInner}>
          <p>Propuesta visual, todavía no publicada.</p>
          <Link href="/">Ver la portada actual</Link>
        </div>
      </div>
      <header className={styles.mast}>
        <div className={`${styles.wrap} ${styles.mastInner}`}>
          <Link href="/preview/portada" className={styles.brand}>
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
              <ArchiveSearch />
              <Link className={`${styles.quiet} ${styles.heroLink}`} href="/agencias">
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
            {excerpts.length > 0 ? (
              <aside className={styles.aside} aria-label="Opiniones publicadas">
                <p className={styles.kicker}>Opiniones publicadas</p>
                <ul className={styles.excerpts}>
                  {excerpts.map((item) => (
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
                        <Score label="Inquilinos" summary={agency.roleRatings.inquilino} />
                        <Score label="Propietarios" summary={agency.roleRatings.propietario} />
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
              <Link className={styles.btn} href="/agencias">
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
              {FAQ.map((item) => (
                <div className={styles.faqItem} key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
            <nav className={styles.docs} aria-label="Documentos">
              <Link href="/explorar">Directorio por ciudad</Link>
              <Link href="/agencias">Registro completo</Link>
              <Link href="/metodologia">Metodología</Link>
              <Link href="/sobre">Sobre Fachada</Link>
              <Link href="/herramientas">Calculadoras de alquiler</Link>
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
          <Link href="/">Portada publicada</Link>
        </div>
      </footer>
    </div>
  );
}
