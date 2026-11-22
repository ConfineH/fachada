import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewForm } from "@/components/review-form";
import { SESSION_STORAGE_KEY } from "@/lib/auth/review-errors";

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

function mockAccount(
  reviews: Array<{
    moderated: boolean;
    flagged: boolean;
    agency: { slug: string } | null;
  }>,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reviews }),
    }),
  );
}

describe("review publication closure", () => {
  it("does not open a form when this account already has a pending review", async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "token");
    mockAccount([
      { moderated: false, flagged: false, agency: { slug: "sol" } },
    ]);

    render(<ReviewForm agencySlug="sol" agencyName="Sol" />);

    expect(await screen.findByText(/pendiente de moderación/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cuenta/i })).toHaveAttribute(
      "href",
      "/cuenta",
    );
    expect(screen.queryByLabelText(/cuéntanos tu experiencia/i)).not.toBeInTheDocument();
  });

  it("points a published review back to the ficha instead of a new form", async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "token");
    mockAccount([{ moderated: true, flagged: false, agency: { slug: "sol" } }]);

    render(<ReviewForm agencySlug="sol" agencyName="Sol" />);

    expect(await screen.findByText(/experiencia publicada/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /en la ficha/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /publicar reseña/i })).not.toBeInTheDocument();
  });

  it("opens the relato when this account has not reviewed the agency", async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "token");
    mockAccount([]);

    render(<ReviewForm agencySlug="sol" agencyName="Sol" />);

    expect(
      await screen.findByLabelText(/cuéntanos tu experiencia/i),
    ).toBeInTheDocument();
  });
});
