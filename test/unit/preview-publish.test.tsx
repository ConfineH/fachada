import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProposedPublish } from "@/components/preview/publish-views";
import type { PreviewController } from "@/components/preview/state";

function controller(query: string, formMode: PreviewController["formMode"] = "narrativa"): PreviewController {
  return {
    go: vi.fn(),
    query,
    setQuery: vi.fn(),
    fichaId: "alba",
    openFicha: vi.fn(),
    openPublish: vi.fn(),
    cityFilter: null,
    setCityFilter: vi.fn(),
    formMode,
    result: null,
    setResult: vi.fn(),
    publishAgencyId: null,
  };
}

describe("preview provisional publish flow", () => {
  it("continues into the form when nothing matches and blocks the ending", async () => {
    const user = userEvent.setup();
    const state = controller("Zzz Inmobiliaria");
    render(<ProposedPublish state={state} />);

    await user.click(screen.getByRole("button", { name: "Continuar con la ficha provisional" }));
    expect(screen.getByLabelText("Cuéntanos tu experiencia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simular publicación inmediata" })).toBeDisabled();
    expect(state.setResult).not.toHaveBeenCalled();
  });

  it("asks to reject a real match before a new ficha", () => {
    render(<ProposedPublish state={controller("Alba Pisos")} />);

    expect(screen.getByRole("button", { name: "Continuar con la ficha provisional" })).toBeDisabled();
    expect(screen.getByText(/No se abre otra ficha/)).toBeInTheDocument();
  });

  it("lets a weak hint continue without calling it a match", () => {
    render(<ProposedPublish state={controller("Gestión Ejemplo")} />);

    expect(screen.getByText(/El 0,45 solo avisa/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar con la ficha provisional" })).toBeEnabled();
  });
});
