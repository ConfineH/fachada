import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReviewForm } from "@/components/review-form";
import { SESSION_STORAGE_KEY } from "@/lib/auth/review-errors";

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  Element.prototype.scrollIntoView = () => {};
});

const NARRATIVE = "Tardaron tres semanas en devolver la fianza del piso.";

function mockFetch(match: {
  cityOnly?: boolean;
  identified?: Array<{ name: string; slug: string; city: string; band: string }>;
  hints?: Array<{ name: string; slug: string; city: string; band: string }>;
}) {
  const calls: Array<{ url: string; body: string }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, body: typeof init?.body === "string" ? init.body : "" });
      const body = url.includes("/api/agencies/match")
        ? match
        : url.includes("/api/me")
          ? { reviews: [] }
          : { review: { moderated: true }, agency: { slug: "sol-gestion-madrid" } };
      return {
        ok: true,
        status: 200,
        json: async () => body,
        text: async () => JSON.stringify(body),
      };
    }),
  );
  return calls;
}

function fillRelato() {
  fireEvent.change(screen.getByLabelText(/cuéntanos tu experiencia/i), {
    target: { value: NARRATIVE },
  });
  fireEvent.change(screen.getByLabelText(/último contacto/i), {
    target: { value: "2026-06-01" },
  });
  fireEvent.change(screen.getByLabelText(/nota/i), { target: { value: "4" } });
  for (const name of [
    /experiencia propia/i,
    /incentivo/i,
    /conflicto de interés/i,
    /normas de uso/i,
  ]) {
    fireEvent.click(screen.getByRole("checkbox", { name }));
  }
}

describe("unlisted name confirmation", () => {
  it("stops a second ficha when the name already identifies one", async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "token");
    const calls = mockFetch({
      identified: [
        {
          name: "Inmobiliaria Sol",
          slug: "inmobiliaria-sol-madrid",
          city: "Madrid",
          band: "exact",
        },
      ],
    });

    render(
      <ReviewForm
        agencySlug=""
        cities={["Madrid"]}
        unlisted={{ name: "Sol Gestión", city: "Madrid" }}
      />,
    );

    expect(
      await screen.findByLabelText(/cuéntanos tu experiencia/i),
    ).toBeInTheDocument();
    fillRelato();
    fireEvent.click(screen.getByRole("button", { name: /publicar reseña/i }));

    expect(await screen.findByText(/puede ser una de estas/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inmobiliaria sol/i })).toHaveAttribute(
      "href",
      "/agencias/inmobiliaria-sol-madrid#dejar-resena",
    );
    expect(calls.some((call) => call.url.includes("/nueva-inmobiliaria"))).toBe(false);

    fireEvent.click(screen.getByRole("checkbox", { name: /no es ninguna/i }));
    fireEvent.click(screen.getByRole("button", { name: /publicar reseña/i }));

    expect(await screen.findByText(/reseña enviada/i)).toBeInTheDocument();
    const posted = calls.find((call) => call.url.includes("/nueva-inmobiliaria"));
    expect(posted?.body).toContain('"confirmNew":true');
    expect(posted?.body).toContain("Sol Gestión");
  });

  it("does not start a ficha named after a city", async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "token");
    const calls = mockFetch({ cityOnly: true });

    render(
      <ReviewForm
        agencySlug=""
        cities={["Madrid"]}
        unlisted={{ name: "Madrid", city: "Sevilla" }}
      />,
    );

    expect(
      await screen.findByLabelText(/cuéntanos tu experiencia/i),
    ).toBeInTheDocument();
    fillRelato();
    fireEvent.click(screen.getByRole("button", { name: /publicar reseña/i }));

    expect(await screen.findByText(/una ciudad no crea una ficha/i)).toBeInTheDocument();
    expect(calls.some((call) => call.url.includes("/nueva-inmobiliaria"))).toBe(false);
  });
});
