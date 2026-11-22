import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FirstExperienceCall } from "@/components/first-experience-call";

describe("first experience call", () => {
  it("asks for the first experience and points at the form", () => {
    render(<FirstExperienceCall agencyName="Inmobiliaria Vacía" />);

    expect(
      screen.getByRole("heading", { name: "Nadie ha contado todavía esta gestión" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Inmobiliaria Vacía/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Contar la primera experiencia" }),
    ).toHaveAttribute("href", "#dejar-resena");
  });
});