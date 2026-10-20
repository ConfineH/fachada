import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DepositTool } from "@/components/tools/deposit-tool";
import { LegalNotice } from "@/components/tools/legal-notice";
import { ToolLayout } from "@/components/tools/tool-layout";
import { TENANT_TOOLS } from "@/lib/domain/tools/catalog";
import { REFORM_2026_NOTE } from "@/lib/domain/tools/constants";
import { DEPOSIT_STAYS_LOCAL, LEGAL_NOTICE } from "@/lib/domain/tools/copy";

describe("tenant tool notices", () => {
  it("shows the shared legal notice verbatim", () => {
    render(<LegalNotice />);
    expect(screen.getByRole("note")).toHaveTextContent(LEGAL_NOTICE);
  });

  it("shows the in-force note on each tool while the 2026 reform is active", () => {
    render(
      <ToolLayout tool={TENANT_TOOLS[0]!}>
        <p>contenido</p>
      </ToolLayout>,
    );
    expect(screen.getByText(REFORM_2026_NOTE)).toBeInTheDocument();
  });

  it("tells the reader the deposit letter stays in the browser", () => {
    render(<DepositTool />);
    expect(screen.getByText(DEPOSIT_STAYS_LOCAL)).toBeInTheDocument();
  });
});
