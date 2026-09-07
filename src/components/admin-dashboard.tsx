"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ClaimWithAgency,
  ReviewWithAgency,
  SubmissionWithMeta,
} from "@/lib/services/admin-service";

export function AdminDashboard({
  initialClaims,
  initialReviews,
  initialSubmissions,
}: {
  initialClaims: ClaimWithAgency[];
  initialReviews: ReviewWithAgency[];
  initialSubmissions: SubmissionWithMeta[];
}) {
  const router = useRouter();
  const [claims, setClaims] = useState(initialClaims);
  const [reviews, setReviews] = useState(initialReviews);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [message, setMessage] = useState("");

  async function runAction(action: string, id: string) {
    setMessage("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error ?? "Error al ejecutar acción");
      return;
    }

    setClaims((current) => current.filter((c) => c.id !== id));
    if (action.startsWith("approve-agency") || action.startsWith("reject-agency")) {
      setSubmissions((current) => current.filter((s) => s.id !== id));
    }
    if (action.startsWith("moderate") || action.startsWith("flag")) {
      setReviews((current) => current.filter((r) => r.id !== id));
    }
    setMessage("Acción completada");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      {message && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <section>
        <h2 className="text-lg font-medium">
          Reclamaciones pendientes ({claims.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {claims.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-stone-600">
              No hay reclamaciones pendientes.
            </li>
          )}
          {claims.map((claim) => (
            <li
              key={claim.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{claim.agencyName}</h3>
                  <p className="text-sm text-stone-600">
                    {claim.contactName} · {claim.contactEmail} ·{" "}
                    {claim.contactPhone}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    Cargo: {claim.representativeRole}
                    {claim.companyCif ? ` · CIF ${claim.companyCif}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {claim.businessPhoneVerified && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">
                        Línea de negocio verificada
                      </span>
                    )}
                    {claim.verificationPath === "document_only" && (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-stone-800">
                        Reclamo documental (sin teléfono)
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        claim.workEmailDomainMatch
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      Email corporativo{" "}
                      {claim.workEmailDomainMatch ? "coincide" : "revisar"}
                    </span>
                  </div>
                  <ul className="mt-2 text-sm text-amber-800">
                    {claim.evidence.map((item) => (
                      <li key={`${item.type}-${item.url}`}>
                        <span className="text-stone-600">
                          {item.type}:{" "}
                        </span>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          {item.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => runAction("approve-claim", claim.id)}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => runAction("reject-claim", claim.id)}
                    className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          Nuevas inmobiliarias sugeridas ({submissions.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {submissions.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-stone-600">
              No hay solicitudes pendientes.
            </li>
          )}
          {submissions.map((submission) => (
            <li
              key={submission.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {submission.name} · {submission.city}
                  </h3>
                  <p className="text-sm text-stone-600">
                    {submission.address} · CP {submission.postalCode}
                  </p>
                  <p className="text-sm text-stone-600">
                    Tel.{" "}
                    {submission.noPhoneOnline
                      ? "No publicado en internet"
                      : submission.phone}
                    {submission.email ? ` · ${submission.email}` : ""}
                  </p>
                  {submission.note && (
                    <p className="mt-2 text-sm text-stone-700">
                      Nota: {submission.note}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      runAction("approve-agency-submission", submission.id)
                    }
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() =>
                      runAction("reject-agency-submission", submission.id)
                    }
                    className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          Reseñas por moderar ({reviews.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {reviews.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-stone-600">
              No hay reseñas pendientes de moderación.
            </li>
          )}
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-500">{review.agencyName}</p>
                  <h3 className="font-semibold">{review.title}</h3>
                  <p className="mt-2 text-stone-700">{review.body}</p>
                  <p className="mt-2 text-sm text-stone-500">
                    {review.role} · {review.rating}/5 ·{" "}
                    {review.flagged ? "Reportada" : "Sin moderar"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => runAction("moderate-review", review.id)}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => runAction("flag-review", review.id)}
                    className="rounded-lg bg-amber-700 px-3 py-2 text-sm text-white"
                  >
                    Marcar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
