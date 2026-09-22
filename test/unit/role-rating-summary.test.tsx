import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoleRatingSummary } from "@/components/role-rating-summary";
import type { AgencyRoleRatings } from "@/lib/domain/ratings";

function ratings(
  inquilino: AgencyRoleRatings["inquilino"],
  propietario: AgencyRoleRatings["propietario"],
): AgencyRoleRatings {
  const reviewCount = inquilino.reviewCount + propietario.reviewCount;
  const total =
    inquilino.averageRating * inquilino.reviewCount +
    propietario.averageRating * propietario.reviewCount;

  return {
    inquilino,
    propietario,
    overall: {
      reviewCount,
      averageRating: reviewCount === 0 ? 0 : total / reviewCount,
    },
  };
}

function fills(heading: string) {
  const card = screen.getByText(heading).parentElement;
  return [...(card?.querySelectorAll("[data-fill]") ?? [])].map((node) =>
    node.getAttribute("data-fill"),
  );
}

describe("RoleRatingSummary", () => {
  it("fills stars to the rounded score and leaves the rest empty", () => {
    render(
      <RoleRatingSummary
        roleRatings={ratings(
          { averageRating: 4.24, reviewCount: 5 },
          { averageRating: 2, reviewCount: 1 },
        )}
      />,
    );

    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getAllByText("de 5")).toHaveLength(2);
    expect(fills("Inquilinos")).toEqual(["1", "1", "1", "1", "0.2"]);
    expect(fills("Propietarios")).toEqual(["1", "1", "0", "0", "0"]);
  });

  it("omits stars when a role has no experiences", () => {
    render(
      <RoleRatingSummary
        roleRatings={ratings(
          { averageRating: 5, reviewCount: 1 },
          { averageRating: 0, reviewCount: 0 },
        )}
      />,
    );

    expect(fills("Inquilinos")).toEqual(["1", "1", "1", "1", "1"]);
    expect(fills("Propietarios")).toEqual([]);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
