import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteNav } from "@/components/site-nav";

describe("site nav", () => {
  it("keeps search, publishing and the account on one bar", () => {
    render(<SiteNav />);

    expect(screen.getByRole("link", { name: "Buscar" })).toHaveAttribute(
      "href",
      "/inquilinos",
    );
    expect(screen.getByRole("link", { name: "Contar experiencia" })).toHaveAttribute(
      "href",
      "/inquilinos#buscar",
    );
    expect(screen.getByRole("link", { name: "Cuenta" })).toHaveAttribute(
      "href",
      "/cuenta",
    );
    expect(screen.queryByRole("link", { name: /herramientas/i })).not.toBeInTheDocument();
  });
});
