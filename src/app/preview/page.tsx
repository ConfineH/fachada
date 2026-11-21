import type { Metadata } from "next";

import { PreviewApp } from "@/components/preview/preview-app";

export const metadata: Metadata = {
  title: "Preview de arquitectura",
  description:
    "Comparación aislada entre la arquitectura actual y la propuesta. Datos ficticios.",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return <PreviewApp />;
}
