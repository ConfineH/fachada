"use client";

import { useMemo, useState } from "react";

import { INCIDENT_TAG_LABELS } from "@/lib/domain/incidents";
import type { ReviewWithResponse, UserRole } from "@/lib/domain/types";

type Filter = "all" | UserRole;

function initialFilterFromPerspective(value?: string): Filter {
  if (value === "inquilino" || value === "propietario") return value;
  return "all";
}

export function AgencyReviewList({
  reviews,
  initialFilter,
}: {
  reviews: ReviewWithResponse[];
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState<Filter>(
    initialFilterFromPerspective(initialFilter),
  );

  const counts = useMemo(
    () => ({
      all: reviews.length,
      inquilino: reviews.filter((r) => r.role === "inquilino").length,
      propietario: reviews.filter((r) => r.role === "propietario").length,
    }),
    [reviews],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter((r) => r.role === filter);
  }, [filter, reviews]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", `Todas (${counts.all})`],
            ["inquilino", `Solo inquilinos (${counts.inquilino})`],
            ["propietario", `Solo propietarios (${counts.propietario})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`filter-chip ${
              filter === value ? "filter-chip-active" : "filter-chip-idle"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul key={filter} className="motion-stagger space-y-4">
        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-stone-600">
            No hay reseñas publicadas para este filtro.
          </li>
        )}
        {filtered.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium capitalize">{review.role}</p>
              <p className="font-medium tabular-nums text-zinc-800">
                {review.rating}/5
              </p>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{review.title}</h3>
            <p className="mt-2 text-stone-700">{review.body}</p>
            {review.incidentTags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {review.incidentTags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                  >
                    {INCIDENT_TAG_LABELS[tag]}
                  </li>
                ))}
              </ul>
            )}
            {review.response && (
              <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-900">
                  Respuesta de la inmobiliaria
                </p>
                <p className="mt-2 text-sm text-emerald-950">{review.response.body}</p>
              </div>
            )}
            <p className="mt-3 text-xs text-stone-500">
              {new Date(review.createdAt).toLocaleDateString("es-ES")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
