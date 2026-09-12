"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ClaimWithAgency,
  LocationWithAgency,
  ReviewWithAgency,
  SubmissionWithMeta,
  TipWithAgency,
} from "@/lib/services/admin-service";
import { AGENCY_TIP_KIND_LABELS } from "@/lib/domain/agency-tips";
import type { ContentNotice } from "@/lib/domain/types";

export function AdminDashboard({
  initialClaims,
  initialReviews,
  initialSubmissions,
  initialLocations,
  initialTips,
  initialContentNotices,
}: {
  initialClaims: ClaimWithAgency[];
  initialReviews: ReviewWithAgency[];
  initialSubmissions: SubmissionWithMeta[];
  initialLocations: LocationWithAgency[];
  initialTips: Array<TipWithAgency & { evidenceUrl?: string }>;
  initialContentNotices: ContentNotice[];
}) {
  const router = useRouter();
  const [claims, setClaims] = useState(initialClaims);
  const [reviews, setReviews] = useState(initialReviews);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [locations, setLocations] = useState(initialLocations);
  const [tips, setTips] = useState(initialTips);
  const [contentNotices, setContentNotices] = useState(initialContentNotices);
  const [noticeRules, setNoticeRules] = useState<Record<string, string>>({});
  const [noticeReasons, setNoticeReasons] = useState<Record<string, string>>({});
  const [reviewReasons, setReviewReasons] = useState<Record<string, string>>({});
  const [reviewAccredited, setReviewAccredited] = useState<
    Record<string, boolean>
  >({});
  const [message, setMessage] = useState("");

  async function runAction(
    action: string,
    id: string,
    extra: Record<string, unknown> = {},
  ) {
    setMessage("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, ...extra }),
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
    if (action.endsWith("-location")) {
      setLocations((current) => current.filter((item) => item.id !== id));
    }
    if (action.endsWith("-tip")) {
      setTips((current) => current.filter((item) => item.id !== id));
    }
    if (action.startsWith("moderate") || action.startsWith("flag")) {
      setReviews((current) => current.filter((r) => r.id !== id));
    }
    if (action === "decide-content-notice") {
      setContentNotices((current) => current.filter((notice) => notice.id !== id));
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
      <button
        type="button"
        onClick={() => runAction("cleanup-review-evidence", "")}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
      >
        Ejecutar borrado de evidencias vencidas
      </button>

      <section>
        <h2 className="text-lg font-medium">
          Denuncias de contenido ({contentNotices.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {contentNotices.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-stone-600">
              No hay denuncias pendientes.
            </li>
          )}
          {contentNotices.map((notice) => (
            <li
              key={notice.id}
              className="rounded-xl border border-amber-200 bg-white p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
                {notice.category} · expediente {notice.id}
              </p>
              <h3 className="mt-2 font-semibold">
                Fragmento: «{notice.exactExcerpt}»
              </h3>
              <p className="mt-2 text-sm text-zinc-700">{notice.legalReason}</p>
              <p className="mt-2 text-xs text-stone-500">
                {notice.reporterName} · {notice.reporterEmail}
                {notice.relationship ? ` · ${notice.relationship}` : ""}
              </p>
              {notice.evidenceUrl ? (
                <a
                  href={notice.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-sm text-amber-800 underline"
                >
                  Ver evidencia aportada
                </a>
              ) : null}
              {notice.appealReason ? (
                <p className="mt-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
                  Revisión solicitada por el autor: {notice.appealReason}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3">
                <input
                  value={noticeRules[notice.id] ?? ""}
                  onChange={(event) =>
                    setNoticeRules((current) => ({
                      ...current,
                      [notice.id]: event.target.value,
                    }))
                  }
                  placeholder="Regla aplicada (p. ej. Normas: datos personales)"
                  className="input-field"
                />
                <textarea
                  value={noticeReasons[notice.id] ?? ""}
                  onChange={(event) =>
                    setNoticeReasons((current) => ({
                      ...current,
                      [notice.id]: event.target.value,
                    }))
                  }
                  placeholder="Motivación individual (mínimo 20 caracteres)"
                  rows={3}
                  className="input-field"
                />
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["retirado", "Retirar", "bg-red-700"],
                      ["mantenido", "Mantener", "bg-emerald-700"],
                      [
                        "informacion_requerida",
                        "Pedir información",
                        "bg-amber-700",
                      ],
                    ] as const
                  ).map(([status, label, color]) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        runAction("decide-content-notice", notice.id, {
                          status,
                          decisionRule: noticeRules[notice.id],
                          decisionReason: noticeReasons[notice.id],
                        })
                      }
                      className={`rounded-lg px-3 py-2 text-sm text-white ${color}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

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
                  {submission.website ? (
                    <p className="text-sm text-stone-600">
                      Web: {submission.website}
                    </p>
                  ) : null}
                  {submission.idealistaUrl ? (
                    <p className="text-sm text-stone-600">
                      Idealista: {submission.idealistaUrl}
                    </p>
                  ) : null}
                  {submission.note ? (
                    <p className="mt-2 text-sm text-stone-700">
                      Nota: {submission.note}
                    </p>
                  ) : null}
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
          Ubicaciones sugeridas ({locations.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {locations.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-stone-600">
              No hay ubicaciones pendientes.
            </li>
          )}
          {locations.map((location) => (
            <li
              key={location.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {location.agencyName} · {location.kind}
                  </h3>
                  <p className="text-sm text-stone-600">
                    {location.address}, {location.postalCode} {location.city}
                  </p>
                  {location.note ? (
                    <p className="mt-1 text-sm text-stone-700">{location.note}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => runAction("publish-location", location.id)}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() => runAction("reject-location", location.id)}
                    className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">
          Aportes a fichas ({tips.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {tips.length === 0 && (
            <li className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-stone-600">
              Nadie ha aportado oficinas ni historial.
            </li>
          )}
          {tips.map((tip) => (
            <li
              key={tip.id}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {tip.agencyName} · {AGENCY_TIP_KIND_LABELS[tip.kind]}
                  </h3>
                  {tip.address ? (
                    <p className="text-sm text-stone-600">
                      {tip.address}
                      {tip.postalCode ? `, ${tip.postalCode}` : ""}{" "}
                      {tip.city}
                    </p>
                  ) : null}
                  {tip.alias ? (
                    <p className="text-sm text-stone-600">
                      {tip.alias}
                      {tip.year ? ` · hasta ${tip.year}` : ""}
                    </p>
                  ) : null}
                  {tip.note ? (
                    <p className="mt-1 text-sm text-stone-700">{tip.note}</p>
                  ) : null}
                  {tip.sourceUrl ? (
                    <p className="mt-1 text-sm">
                      <a
                        href={tip.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-800 underline"
                      >
                        {tip.sourceUrl}
                      </a>
                    </p>
                  ) : null}
                  {tip.evidenceUrl ? (
                    <p className="mt-2">
                      <a
                        href={tip.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-amber-800 underline"
                      >
                        Ver captura
                      </a>
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => runAction("approve-tip", tip.id)}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() => runAction("reject-tip", tip.id)}
                    className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white"
                  >
                    Descartar
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
                  {review.evidenceUrl ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={review.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-amber-800 underline"
                      >
                        Revisar evidencia privada
                      </a>
                      <label className="flex items-center gap-2 text-xs text-zinc-700">
                        <input
                          type="checkbox"
                          checked={Boolean(reviewAccredited[review.id])}
                          onChange={(event) =>
                            setReviewAccredited((current) => ({
                              ...current,
                              [review.id]: event.target.checked,
                            }))
                          }
                        />
                        Evidencia suficiente para acreditar la experiencia
                      </label>
                    </div>
                  ) : null}
                  <input
                    value={reviewReasons[review.id] ?? ""}
                    onChange={(event) =>
                      setReviewReasons((current) => ({
                        ...current,
                        [review.id]: event.target.value,
                      }))
                    }
                    placeholder="Motivo de la decisión"
                    className="input-field mt-3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      runAction("moderate-review", review.id, {
                        reason: reviewReasons[review.id],
                        accreditExperience: Boolean(
                          reviewAccredited[review.id],
                        ),
                      })
                    }
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() =>
                      runAction("flag-review", review.id, {
                        reason: reviewReasons[review.id],
                      })
                    }
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
