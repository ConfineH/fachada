import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewReportForm } from "@/components/review-report-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ReviewReportForm", () => {
  it("requests an email code from the same endpoint as the review form", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<ReviewReportForm reviewId="review-1" />);
    await user.click(screen.getByRole("button", { name: "Denunciar" }));
    await user.type(screen.getByPlaceholderText("Correo de contacto"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Enviarme código" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/request-email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ana@example.com" }),
    });
    expect(await screen.findByText(/te hemos enviado un código/i)).toBeInTheDocument();
  });
});
