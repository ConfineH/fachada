import { describe, expect, it } from "vitest";

import { screenReviewText } from "@/lib/domain/review-prefilter";

const base = {
  title: "Visita correcta",
  pros: "La visita fue puntual y el piso estaba limpio.",
  cons: "Tardaron una semana en contestar un correo.",
  agencyName: "Inmobiliaria Sol",
  city: "Madrid",
  extraAllowedNames: ["Chamberí", "Salamanca"],
};

describe("screenReviewText", () => {
  it("accepts a normal review and ignores cities, neighborhoods and the agency", () => {
    expect(screenReviewText(base).outcome).toBe("clean");
    expect(
      screenReviewText({
        ...base,
        cons: "La oficina de Chamberí, en Salamanca, tardó en contestar.",
      }).outcome,
    ).toBe("clean");
    expect(
      screenReviewText({
        ...base,
        title: "Inmobiliaria Sol en Madrid",
        cons: "Gestión lenta en la oficina de Sol durante el mes de mayo.",
      }).outcome,
    ).toBe("clean");
  });

  it("blocks contact data, identity documents and insults before send", () => {
    expect(screenReviewText({ ...base, cons: "Escribidme a ana@gmail.com por favor." }).outcome).toBe("block");
    expect(screenReviewText({ ...base, cons: "Mirad https://ejemplo.com/ficha antes de firmar." }).outcome).toBe("block");
    expect(screenReviewText({ ...base, cons: "Llamad al 600 111 222 y lo explico." }).outcome).toBe("block");
    expect(screenReviewText({ ...base, cons: "Mi DNI es 12345678Z y lo dejo aquí." }).outcome).toBe("block");
    expect(screenReviewText({ ...base, cons: "El DNI 12.345.678-Z está en el contrato." }).outcome).toBe("block");
    expect(screenReviewText({ ...base, cons: "El NIE X1234567L aparece en el contrato." }).outcome).toBe("block");
    expect(screenReviewText({ ...base, cons: "El NIF de la empresa es B12345674." }).outcome).toBe("block");
    expect(
      screenReviewText({
        ...base,
        cons: "El IBAN ES12 1234 1234 1234 1234 1234 no es mío.",
      }).outcome,
    ).toBe("block");
    expect(
      screenReviewText({
        ...base,
        cons: "La cuenta DE89 3704 0044 0532 0130 00 tampoco.",
      }).outcome,
    ).toBe("block");
    expect(
      screenReviewText({
        ...base,
        cons: "Transferí a DE89 3704 0044 0532 0130 00 y no volvió.",
      }).outcome,
    ).toBe("block");
    expect(
      screenReviewText({
        ...base,
        cons: "La referencia del anuncio es AB12 3456 7890 1234.",
      }).outcome,
    ).toBe("clean");
    expect(screenReviewText({ ...base, cons: "El trato fue de gilipollas todo el mes." }).outcome).toBe("block");
  });

  it("holds crime accusations and person names, with a factual reformulation", () => {
    const crime = screenReviewText({
      ...base,
      cons: "Son unos estafadores y no devolvieron la fianza.",
    });
    expect(crime.outcome).toBe("hold");
    expect(crime.hits.some((hit) => hit.code === "crime_accusation")).toBe(true);
    expect(crime.hits[0]?.message).toMatch(/me cobraron X sin factura/);

    const named = screenReviewText({
      ...base,
      cons: "Hablé con Lucía y no contestó a los mensajes.",
    });
    expect(named.outcome).toBe("hold");
    expect(named.hits.some((hit) => hit.code === "person_name")).toBe(true);

    const titled = screenReviewText({
      ...base,
      cons: "El comercial Pedro no devolvió la fianza pactada.",
    });
    expect(titled.outcome).toBe("hold");
    expect(titled.hits.some((hit) => hit.message.includes("Pedro"))).toBe(true);

    const lowercase = screenReviewText({
      ...base,
      cons: "Hablé con la comercial marta y no contestó.",
    });
    expect(lowercase.outcome).toBe("hold");
    expect(lowercase.hits.some((hit) => hit.message.toLowerCase().includes("marta"))).toBe(true);

    const spoken = screenReviewText({
      ...base,
      cons: "Habló con Marta y no contestó a los mensajes.",
    });
    expect(spoken.outcome).toBe("hold");
    expect(spoken.hits.some((hit) => hit.message.includes("Marta"))).toBe(true);
  });

  it("does not treat the word after a role as a name unless it is a given name or a capital", () => {
    for (const cons of [
      "El agente que vino no explicó la fianza.",
      "La comercial nos enseñó el piso y se fue.",
      "El gestor del alquiler tardó una semana.",
    ]) {
      const result = screenReviewText({ ...base, cons });
      expect(result.hits.some((hit) => hit.code === "person_name"), cons).toBe(false);
      expect(result.outcome, cons).toBe("clean");
    }
  });

  it("does not treat a lowercase given name as a person unless it follows a role", () => {
    for (const cons of [
      "Entramos en julio y el piso seguía sucio.",
      "Había pintadas de rosa en el portal.",
      "Hay un pilar en el salón y no lo arreglaron.",
      "La cocina era blanca y el horno no funcionaba.",
      "Si tomas el piso, revisa la caldera antes.",
      "Pidieron cesar el contrato antes de devolver la fianza.",
    ]) {
      expect(screenReviewText({ ...base, cons }).outcome, cons).toBe("clean");
    }
  });

  it("does not hold streets, institutions, holidays or another agency name", () => {
    expect(
      screenReviewText({
        ...base,
        cons: "La oficina está en la calle Bravo Murillo y cerraron por Navidad.",
      }).outcome,
    ).toBe("clean");
    expect(
      screenReviewText({
        ...base,
        title: "Hacienda",
        cons: "Me pidieron un justificante y tardaron una semana en devolverlo.",
      }).outcome,
    ).toBe("clean");
    expect(
      screenReviewText({
        ...base,
        allowedNames: ["Otra Inmobiliaria", "Otra Inmobiliaria SL", "Madrid", "Valencia"],
        cons: "Comparé con Otra Inmobiliaria en Valencia y aquí tardaron más.",
      }).outcome,
    ).toBe("clean");
  });

  it("does not treat a leading verb or a neighborhood as a person", () => {
    expect(
      screenReviewText({
        ...base,
        cons: "Tardaron en devolver la fianza de Chamberí.",
      }).outcome,
    ).toBe("clean");
    expect(
      screenReviewText({
        ...base,
        title: "Lucía no contestó",
        cons: "La llamada quedó sin respuesta durante varios días.",
      }).hits.some((hit) => hit.code === "person_name"),
    ).toBe(true);
  });

  it("prefers a hard block when the text also accuses a crime", () => {
    const result = screenReviewText({
      ...base,
      cons: "Son unos estafadores. Escribid a ana@gmail.com.",
    });
    expect(result.outcome).toBe("block");
    expect(result.hits.some((hit) => hit.code === "email")).toBe(true);
  });
});
