"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { authHeaders, readSessionToken } from "@/lib/auth/session-client";
import { INCIDENT_TAG_LABELS, type IncidentTag } from "@/lib/domain/incidents";
import {
  reviewProsCons,
  reviewPublicByline,
} from "@/lib/domain/review-copy";
import type { UserRole } from "@/lib/domain/types";

type Filter = "all" | UserRole;

type PublicReview = {
  id: string;
  role: UserRole;
  rating: number;
  title: string;
  body: string;
  pros?: string;
  cons?: string;
  anonymous: boolean;
  publicName?: string;
  wouldRecommend?: boolean;
  helpfulCount: number;
  incidentTags: IncidentTag[];
  createdAt: string;
  response?: { body: string; createdAt: string };
};

function initialFilterFromPerspective(value?: string): Filter {
  if (value === "inquilino" || value === "propietario") return value;
  return "all";
}

export function AgencyReviewList({
  reviews,
  initialFilter,
}: {
  reviews: PublicReview[];
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState<Filter>(
    initialFilterFromPerspective(initialFilter),
  );
  const [helpful, setHelpful] = useState<Record<string, number>>(() =>
    Object.fromEntries(reviews.map((review) => [review.id, review.helpfulCount])),
  );
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [hint, setHint] = useState("");

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

  async function markHelpful(reviewId: string) {
    const token = readSessionToken();
    if (!token) {
      setHint("Identifícate en tu cuenta para marcar una reseña como útil.");
      return;
    }
    const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
      method: "POST",
      headers: authHeaders(token),
    });
    const data = (await res.json()) as {
      helpfulCount?: number;
      error?: string;
    };
    if (!res.ok) {
      setHint(data.error ?? "No se pudo marcar como útil.");
      return;
    }
    if (typeof data.helpfulCount === "number") {
      setHelpful((current) => ({ ...current, [reviewId]: data.helpfulCount! }));
    }
    setVoted((current) => ({ ...current, [reviewId]: true }));
    setHint("");
  }

  return (
    <div>
      {hint && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {hint}{" "}
          <Link href="/cuenta" className="underline">
            Ir a la cuenta
          </Link>
        </p>
      )}
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
        {filtered.map((review) => {
          const split = reviewProsCons(review);
          return (
            <li
              key={review.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium">{reviewPublicByline(review)}</p>
                <p className="font-medium tabular-nums text-zinc-800">
                  {review.rating}/5
                </p>
              </div>
              <h3 className="mt-2 text-lg font-semibold">{review.title}</h3>
              {review.wouldRecommend !== undefined && (
                <p className="mt-2 text-sm text-zinc-700">
                  {review.wouldRecommend
                    ? "Recomendaría esta inmobiliaria"
                    : "No recomendaría esta inmobiliaria"}
                </p>
              )}
              {split.pros && split.cons ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Ventajas
                    </p>
                    <p className="mt-1 text-sm text-emerald-950">{split.pros}</p>
                  </div>
                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                      Desventajas
                    </p>
                    <p className="mt-1 text-sm text-rose-950">{split.cons}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-stone-700">{split.body}</p>
              )}
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
                  <p className="mt-2 text-sm text-emerald-950">
                    {review.response.body}
                  </p>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-stone-500">
                  {new Date(review.createdAt).toLocaleDateString("es-ES")}
                </p>
                <button
                  type="button"
                  onClick={() => markHelpful(review.id)}
                  disabled={Boolean(voted[review.id])}
                  className="rounded-full border border-stone-300 px-3 py-1 text-sm text-zinc-700 transition hover:border-zinc-400 disabled:opacity-60"
                >
                  Útil ({helpful[review.id] ?? review.helpfulCount})
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
