import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DepositTool } from "@/components/tools/deposit-tool";
import { LegalNotice } from "@/components/tools/legal-notice";
import { DEPOSIT_STAYS_LOCAL, LEGAL_NOTICE } from "@/lib/domain/tools/copy";

describe("tenant tool notices", () => {
  it("shows the shared legal notice verbatim", () => {
    render(<LegalNotice />);
    expect(screen.getByRole("note")).toHaveTextContent(LEGAL_NOTICE);
  });

  it("tells the reader the deposit letter stays in the browser", () => {
    render(<DepositTool />);
    expect(screen.getByText(DEPOSIT_STAYS_LOCAL)).toBeInTheDocument();
  });
});
