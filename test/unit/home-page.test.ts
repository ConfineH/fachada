import { describe, expect, it } from "vitest";

import {
  HOME_PAGE_FAQS,
  managementFragment,
  selectHomeExcerpts,
  type HomeExcerptReview,
} from "@/lib/domain/home-page";
import { faqJsonLd } from "@/lib/seo";

const ALAMO =
  "Quitando lo básico, que es que el piso estaba en condiciones, todo lo relativo a mantenimiento, problemas con cobros y demás asuntos que atañen a la inmobiliaria o agencia gestora fueron mal gestionados. Además, hemos tenido problemas con el cobro de la fianza, de donde se nos han restado importes que no correspondían, como limpieza tras realizar varias en profundidad, pintura cuando no ha habido desperfectos, y retirada de basura cuando se tiró todo. Sobra decir que no nos contestaban a nada, y si lo hacían era con mucho retraso.";

const ALQUILER_PROS =
  "Son bastante rápidos y atentos con los problemas del piso. Si hay algún arreglo a realizar no suelen tardar en exceso (aunque tampoco es que lo vayan a tener para mañana). Fueron amables y facilitaron tanto la firma como la visita del piso. Contestan rápido.";

const ALQUILER_CONS =
  "Podrían ser un poco mas rápidos con las reparaciones, y avisar si se va a ir un compañero, así nosotros podemos sugerir a conocidos, lo cual facilita la vida en el piso (siempre y cuando también les cuadre claro).";

function review(
  body: string,
  rating: number,
  createdAt: string,
  extra: Partial<HomeExcerptReview> = {},
): HomeExcerptReview {
  return {
    role: "inquilino",
    rating,
    createdAt,
    body,
    ...extra,
  };
}

describe("managementFragment", () => {
  it("keeps the management clause of the current prose opinion", () => {
    const text = managementFragment(review(ALAMO, 2, "2024-01-01"));
    expect(text).toBe(
      "todo lo relativo a mantenimiento, problemas con cobros y demás asuntos que atañen a la inmobiliaria o agencia gestora fueron mal gestionados.",
    );
    expect(ALAMO).toContain(text);
  });

  it("skips the flat sentence and keeps the repair sentence", () => {
    const text = managementFragment(
      review("", 4, "2024-06-01", {
        pros: ALQUILER_PROS,
        cons: ALQUILER_CONS,
      }),
    );
    expect(text).toBe(
      "Si hay algún arreglo a realizar no suelen tardar en exceso (aunque tampoco es que lo vayan a tener para mañana).",
    );
    expect(ALQUILER_PROS).toContain(text);
    expect(text).not.toMatch(/problemas del piso/);
  });

  it("returns nothing when the text is only about the flat", () => {
    expect(
      managementFragment(
        review("El piso estaba limpio y la zona es tranquila.", 5, "2024-01-01"),
      ),
    ).toBeNull();
  });
});

describe("selectHomeExcerpts", () => {
  it("shows both current opinions, in name order, without using the rating as a filter", () => {
    const excerpts = selectHomeExcerpts([
      {
        slug: "alquiler-y-comercializacion-propiedades-sl",
        name: "Alquiler y Comercialización Propiedades SL",
        reviews: [
          review("", 4, "2024-06-01", {
            pros: ALQUILER_PROS,
            cons: ALQUILER_CONS,
          }),
        ],
      },
      {
        slug: "alamo-foro-s-l",
        name: "Alamo Foro S.L.",
        reviews: [review(ALAMO, 2, "2024-01-01")],
      },
    ]);

    expect(excerpts.map((item) => item.name)).toEqual([
      "Alamo Foro S.L.",
      "Alquiler y Comercialización Propiedades SL",
    ]);
    expect(excerpts.map((item) => item.rating)).toEqual([2, 4]);
    expect(excerpts[0]?.text.startsWith("todo lo relativo a mantenimiento")).toBe(
      true,
    );
  });

  it("with more opinions, keeps the two latest management fragments rather than the rating extremes", () => {
    const excerpts = selectHomeExcerpts([
      {
        slug: "extremo-bajo",
        name: "Extremo Bajo",
        reviews: [
          review("La fianza no volvió y nadie contestó.", 1, "2023-01-01"),
        ],
      },
      {
        slug: "extremo-alto",
        name: "Extremo Alto",
        reviews: [
          review(
            "Las reparaciones llegaron al día siguiente.",
            5,
            "2023-06-01",
          ),
        ],
      },
      {
        slug: "alamo-foro-s-l",
        name: "Alamo Foro S.L.",
        reviews: [review(ALAMO, 2, "2024-01-01")],
      },
      {
        slug: "reciente",
        name: "Reciente",
        reviews: [
          review(
            "Tardaron en contestar sobre los honorarios.",
            3,
            "2025-01-01",
          ),
        ],
      },
      {
        slug: "alquiler",
        name: "Alquiler y Comercialización Propiedades SL",
        reviews: [
          review("", 4, "2024-06-01", {
            pros: ALQUILER_PROS,
            cons: ALQUILER_CONS,
          }),
        ],
      },
    ]);

    expect(excerpts.map((item) => [item.name, item.rating])).toEqual([
      ["Alquiler y Comercialización Propiedades SL", 4],
      ["Reciente", 3],
    ]);
  });

  it("uses the first published review that talks about management, not the lowest rating", () => {
    const excerpts = selectHomeExcerpts([
      {
        slug: "mixta",
        name: "Mixta",
        reviews: [
          review("Devolvieron la fianza en una semana.", 3, "2025-03-01"),
          review("El cobro de honorarios fue un abuso.", 1, "2024-01-01"),
        ],
      },
    ]);

    expect(excerpts).toEqual([
      {
        slug: "mixta",
        name: "Mixta",
        role: "inquilino",
        rating: 3,
        text: "Devolvieron la fianza en una semana.",
      },
    ]);
  });
});

describe("HOME_PAGE_FAQS", () => {
  it("publishes the same two answers in the page schema", () => {
    const schema = faqJsonLd([...HOME_PAGE_FAQS]);
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity?.map((item) => item.name)).toEqual(
      HOME_PAGE_FAQS.map((item) => item.question),
    );
    expect(
      schema.mainEntity?.map((item) => item.acceptedAnswer.text),
    ).toEqual(HOME_PAGE_FAQS.map((item) => item.answer));
  });
});
