import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archive-serif",
});

export const metadata: Metadata = {
  title: { absolute: "Propuesta de portada · Fachada" },
  description:
    "Propuesta visual aislada de la portada. No sustituye a la página publicada.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/preview/portada" },
};

export default function PortadaPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={sourceSerif.variable}>{children}</div>;
}
