import { LEGAL_NOTICE } from "@/lib/domain/tools/copy";

export function LegalNotice() {
  return (
    <p
      role="note"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
    >
      {LEGAL_NOTICE}
    </p>
  );
}
