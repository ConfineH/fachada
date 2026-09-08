"use client";

import { useState } from "react";

import { AgencyReviewList } from "@/components/agency-review-list";

type Tab = "opiniones" | "anuncios";

export function AgencyFichaTabs({
  reviews,
  initialFilter,
  portalLinks,
}: {
  reviews: Parameters<typeof AgencyReviewList>[0]["reviews"];
  initialFilter?: string;
  portalLinks: { idealistaUrl?: string; fotocasaUrl?: string };
}) {
  const [tab, setTab] = useState<Tab>("opiniones");

  return (
    <div>
      <div className="flex gap-2 border-b border-stone-200">
        {(
          [
            ["opiniones", "Opiniones"],
            ["anuncios", "Anuncios"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === value
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "opiniones" ? (
        <div className="mt-6">
          <AgencyReviewList reviews={reviews} initialFilter={initialFilter} />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white p-6">
          <h3 className="text-lg font-semibold">Anuncios, más adelante</h3>
          <p className="mt-2 text-sm text-zinc-700">
            Cuando se monte, serán anuncios propios de inmobiliarias que hayan
            reclamado la ficha y tengan reseñas contrastadas. No un compilador
            de Idealista ni un portal de pisos.
          </p>
          {(portalLinks.idealistaUrl || portalLinks.fotocasaUrl) && (
            <p className="mt-4 text-sm text-zinc-600">
              Mientras tanto, enlaces que la ficha ya tiene:{" "}
              {portalLinks.idealistaUrl && (
                <a
                  href={portalLinks.idealistaUrl}
                  className="link-brand"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Idealista
                </a>
              )}
              {portalLinks.idealistaUrl && portalLinks.fotocasaUrl ? " · " : ""}
              {portalLinks.fotocasaUrl && (
                <a
                  href={portalLinks.fotocasaUrl}
                  className="link-brand"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Fotocasa
                </a>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
