import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HandoverTool } from "@/components/tools/handover-tool";
import {
  ACTA_DEPOSIT_STORAGE_KEY,
  ACTA_EXPORT_KIND,
  actaContentHash,
  emptyActa,
  parseActaDepositDraft,
  roomFromPreset,
  ROOM_PRESETS,
  type ActaFile,
} from "@/lib/domain/tools/handover";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

async function entryFile(): Promise<ActaFile> {
  let n = 0;
  const acta = emptyActa("entrada");
  acta.address = "Calle Mayor 1";
  acta.date = "2026-10-21";
  acta.time = "10:30";
  acta.landlordName = "Ana Ruiz";
  acta.tenantName = "Luis Pérez";
  acta.meters = { luz: "100", agua: "20", gas: "5" };
  acta.keys = 3;
  acta.remotes = 1;
  acta.rooms = [roomFromPreset(ROOM_PRESETS[0]!, () => `id-${++n}`)];
  acta.rooms[0]!.elements[1]!.condition = "danado";
  acta.rooms[0]!.elements[1]!.note = "Ya estaba";
  return {
    kind: ACTA_EXPORT_KIND,
    exportedAt: "2026-10-21T10:30:00.000Z",
    contentHash: await actaContentHash(acta),
    acta,
  };
}

describe("handover tool", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("warns when the draft cannot be saved on this device", async () => {
    render(<HandoverTool />);
    expect(
      await screen.findByText(/No se ha podido guardar el acta en este dispositivo/, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("asks before an import replaces the draft and only links the deposit letter on exit", async () => {
    const user = userEvent.setup();
    render(<HandoverTool />);
    expect(await screen.findByRole("heading", { name: "Salón" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /carta de la fianza/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Salida del piso" }));
    expect(screen.getByRole("link", { name: /carta de la fianza/ })).toBeInTheDocument();

    const file = new File([JSON.stringify(await entryFile())], "acta.json", { type: "application/json" });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await user.upload(screen.getByLabelText(/Acta de entrada/), file);
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("Dirección")).toHaveValue("");

    confirm.mockReturnValue(true);
    await user.upload(screen.getByLabelText(/Acta de entrada/), file);
    await waitFor(() => expect(screen.getByLabelText("Dirección")).toHaveValue("Calle Mayor 1"));

    await user.selectOptions(screen.getByLabelText("Estado de Paredes"), "danado");
    await user.click(screen.getByRole("link", { name: /carta de la fianza/ }));
    const draft = parseActaDepositDraft(sessionStorage.getItem(ACTA_DEPOSIT_STORAGE_KEY) ?? "");
    expect(draft?.deductionDetail).toContain("Paredes");
    expect(draft?.deductionDetail).not.toContain("Suelo");
    expect(draft?.deductionDetail).not.toContain("Ya estaba");
    confirm.mockRestore();
  });

  it("warns and does not keep more than six photos on one element", async () => {
    const user = userEvent.setup();
    render(<HandoverTool />);
    expect(await screen.findByRole("heading", { name: "Salón" })).toBeInTheDocument();
    const input = screen.getAllByLabelText("Fotos, solo en este dispositivo")[0];
    if (!input) throw new Error("Falta el campo de fotos.");
    const files = Array.from({ length: 7 }, (_, index) => new File(["x"], `foto-${index}.jpg`, { type: "image/jpeg" }));
    await user.upload(input, files);
    expect(await screen.findByText("Como máximo, 6 fotos por elemento.")).toBeInTheDocument();
  });
});
