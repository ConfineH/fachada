import { getLegal } from "@/lib/legal";
import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "Fachada";

export const DEFAULT_TITLE =
  "Antes de firmar, mira cómo trata esa inmobiliaria";

export const DEFAULT_DESCRIPTION =
  "Archivo independiente de experiencias de alquiler y gestión en España. Notas separadas para inquilinos y propietarios, con cuenta identificada y moderación humana.";

export function pageMeta(title: string, description: string, path: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      locale: "es_ES" as const,
      siteName: SITE_NAME,
      type: "website" as const,
    },
    twitter: {
      card: "summary" as const,
      title,
      description,
    },
  };
}

export function absoluteUrl(path = "/") {
  const origin = getSiteUrl();
  if (path === "/" || path === "") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  const legal = getLegal();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_DESCRIPTION,
    email: legal.contactEmail.startsWith("[") ? undefined : legal.contactEmail,
    address: legal.holderAddress.startsWith("[")
      ? undefined
      : {
          "@type": "PostalAddress",
          streetAddress: legal.holderAddress,
          addressCountry: "ES",
        },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: "es-ES",
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/agencias")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(pairs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((pair) => ({
      "@type": "Question",
      name: pair.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: pair.answer,
      },
    })),
  };
}

export function agencyJsonLd(agency: {
  name: string;
  slug: string;
  city: string;
  address: string;
  postalCode: string;
  reviewCount: number;
  averageRating: number;
}) {
  const url = absoluteUrl(`/agencias/${agency.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": url,
    name: agency.name,
    url,
    address: {
      "@type": "PostalAddress",
      streetAddress: agency.address,
      addressLocality: agency.city,
      postalCode: agency.postalCode,
      addressCountry: "ES",
    },
    ...(agency.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: agency.averageRating.toFixed(1),
            bestRating: "5",
            worstRating: "1",
            reviewCount: String(agency.reviewCount),
          },
        }
      : {}),
  };
}

export const HOME_FAQS = [
  {
    question: "¿Fachada verifica que la experiencia ocurrió?",
    answer:
      "No de forma automática. Quien escribe confirma un correo y declara una experiencia propia reciente. Solo marcamos «experiencia acreditada» si una persona revisa evidencia privada.",
  },
  {
    question: "¿En qué se diferencia de las reseñas de Google o Idealista?",
    answer:
      "Google mezcla visitas a oficina, ventas y azar. Idealista vende anuncios. Fachada separa inquilino y propietario y se centra en la gestión: fianza, reparaciones, honorarios y comunicación.",
  },
  {
    question: "¿Puede una inmobiliaria borrar una reseña negativa?",
    answer:
      "No. Puede reclamar la ficha y responder. Una crítica no se retira por ser negativa; sí se restringe si es ilícita, falsa o expone datos ajenos.",
  },
  {
    question: "¿El correo del autor aparece en la ficha?",
    answer:
      "No. El correo queda en nuestros registros para moderación. En la ficha pública sale un seudónimo o el rol. No prometemos anonimato absoluto.",
  },
] as const;
