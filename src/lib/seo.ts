import { isConfirmedStreetAddress } from "@/lib/domain/agency-presence";
import { getLegal, hasRegisteredHolder, isPlaceholder } from "@/lib/legal";
import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "Fachada";

export const DEFAULT_TITLE =
  "Antes de firmar, mira la reputación de esa inmobiliaria";

export const DEFAULT_DESCRIPTION =
  "Archivo de reputación de inmobiliarias en España: experiencias de inquilino y de propietario sobre la gestión del alquiler. Puedes publicar en la ficha de forma anónima; la cuenta queda identificada para moderar.";

/** WhatsApp / OG: one short line. The SEO description can be longer. */
export const SHARE_DESCRIPTION =
  "Inquilinos y propietarios cuentan cómo gestiona el alquiler esa inmobiliaria.";

export function pageMeta(
  title: string,
  description: string,
  path: string,
  shareDescription = description,
) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: shareDescription,
      url: absoluteUrl(path),
      locale: "es_ES" as const,
      siteName: SITE_NAME,
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description: shareDescription,
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
    logo: absoluteUrl("/fachada-mark.svg"),
    description: DEFAULT_DESCRIPTION,
    email: isPlaceholder(legal.contactEmail) ? undefined : legal.contactEmail,
    address: hasRegisteredHolder()
      ? {
          "@type": "PostalAddress",
          streetAddress: legal.holderAddress,
          addressCountry: "ES",
        }
      : undefined,
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

export function webApplicationJsonLd(app: {
  name: string;
  description: string;
  path: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: app.name,
    url: absoluteUrl(app.path),
    description: app.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    inLanguage: "es-ES",
    isAccessibleForFree: true,
    dateModified: app.dateModified,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}

export function itemListJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
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
  logoUrl?: string;
}) {
  const url = absoluteUrl(`/agencias/${agency.slug}`);
  // La media recibida mezcla perspectivas. No se publica como AggregateRating.
  void agency.averageRating;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": url,
    name: agency.name,
    url,
    ...(agency.logoUrl ? { image: agency.logoUrl } : {}),
    address: {
      "@type": "PostalAddress",
      ...(isConfirmedStreetAddress(agency.address)
        ? {
            streetAddress: agency.address,
            postalCode: agency.postalCode,
          }
        : {}),
      addressLocality: agency.city,
      addressCountry: "ES",
    },
  };
}

export function agencyRecordCopy(
  name: string,
  places: string,
  reviewCount: number,
) {
  const where = places ? ` en ${places}` : "";
  const title =
    reviewCount > 0
      ? `Opiniones de ${name}`
      : `Opiniones de ${name} · sin experiencias`;
  const description =
    reviewCount <= 0
      ? `Todavía no hay experiencias publicadas sobre ${name}${where}. La ficha recoge opiniones de inquilinos y propietarios sobre la gestión, no sobre el piso.`
      : reviewCount === 1
        ? `Opiniones sobre la gestión de ${name}${where}. Hay 1 experiencia publicada: es una opinión individual, no una reputación consolidada.`
        : `Opiniones sobre la gestión de ${name}${where}. Hay ${reviewCount.toLocaleString("es-ES")} experiencias publicadas. Inquilinos y propietarios se cuentan por separado.`;
  return { title, description };
}

export const HOME_FAQS = [
  {
    question: "¿Fachada verifica que la experiencia ocurrió?",
    answer:
      "No de forma automática. Quien escribe entra con un correo verificado y declara una experiencia propia reciente. Si el texto pasa un filtro automático, se publica al momento como experiencia declarada. Solo marcamos «experiencia acreditada» si una persona revisa pruebas privadas.",
  },
  {
    question: "¿En qué se diferencia de las reseñas de Google o Idealista?",
    answer:
      "Fachada archiva la reputación de la inmobiliaria: experiencias de inquilino y de propietario sobre la gestión (fianza, reparaciones, honorarios, comunicación). Google mezcla oficina, ventas y visitas. Idealista está pensado para el piso, no para esa reputación de gestión.",
  },
  {
    question: "¿Puede una inmobiliaria borrar una reseña negativa?",
    answer:
      "No. Puede reclamar la ficha y responder. Una crítica no se retira por ser negativa; sí se restringe si es ilícita, falsa o expone datos ajenos.",
  },
  {
    question: "¿El correo del autor aparece en la ficha?",
    answer:
      "No. Puedes publicar en la ficha de forma anónima o con seudónimo. El correo queda en nuestros registros para moderar. No prometemos el anonimato absoluto: nosotros sí sabemos qué cuenta escribió.",
  },
] as const;
