"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { IncidentMarkFields } from "@/components/incident-mark-fields";
import { AgencyLogo } from "@/components/agency-logo";
import {
  sentimentsFromMarks,
  tagsFromSentiments,
  unsetMarkMessage,
  type IncidentMarks,
  type IncidentSentiments,
  type IncidentTag,
} from "@/lib/domain/incidents";
import { publicApiUrl } from "@/lib/site-url";
import { authHeaders } from "@/lib/auth/session-client";
import { WHOLE_NUMBER_RATING_ERROR } from "@/lib/domain/review-authenticity";

export type AccountReviewItem = {
  id: string;
  title: string;
  rating: number;
  pros?: string;
  cons?: string;
  anonymous: boolean;
  publicName?: string;
  wouldRecommend?: boolean;
  incidentTags: IncidentTag[];
  incidentSentiments?: IncidentSentiments;
  moderated: boolean;
  flagged: boolean;
  moderationReason?: string;
  createdAt: string;
  editedAt?: string;
  agency: { name: string; slug: string; logoUrl?: string } | null;
};

type ModerationDecision = {
  id: string;
  reviewId: string;
  status: string;
  decisionRule?: string;
  decisionReason?: string;
  appealedAt?: string;
};

export function AccountReviews({
  token,
  reviews,
  decisions,
  appealReasons,
  onAppealReason,
  onAppeal,
  onReload,
  onError,
}: {
  token: string;
  reviews: AccountReviewItem[];
  decisions: ModerationDecision[];
  appealReasons: Record<string, string>;
  onAppealReason: (id: string, value: string) => void;
  onAppeal: (id: string) => void;
  onReload: () => void;
  onError: (message: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(reviewId: string) {
    setBusyId(reviewId);
    const res = await fetch(publicApiUrl(`/api/reviews/${reviewId}`), {
      method: "DELETE",
      headers: authHeaders(token),
    });
    const data = (await res.json()) as { error?: string };
    setBusyId(null);
    if (!res.ok) {
      onError(data.error ?? "No se pudo eliminar la reseña.");
      return;
    }
    setConfirmingId(null);
    onReload();
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="font-medium">Tus reseñas</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Puedes editar o eliminar las que has escrito. Si las editas, dejan de
        verse en la ficha hasta una nueva revisión y quedan marcadas como
        editadas. El rol, la inmobiliaria y la fecha de la experiencia no se
        pueden cambiar.
      </p>
      {reviews.length === 0 && (
        <p className="mt-2 text-sm text-zinc-600">Aún no has enviado reseñas.</p>
      )}
      <ul className="mt-3 space-y-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border-t border-stone-100 pt-3 first:border-0 first:pt-0"
          >
            <p className="font-medium">{review.title}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
              {review.agency ? (
                <>
                  <AgencyLogo
                    name={review.agency.name}
                    src={review.agency.logoUrl}
                    size="sm"
                  />
                  <Link href={`/agencias/${review.agency.slug}`} className="link-brand">
                    {review.agency.name}
                  </Link>
                </>
              ) : (
                "Inmobiliaria"
              )}{" "}
              · {review.rating}/5 · {reviewStatus(review)}
              {review.editedAt ? " · Editada" : ""}
            </p>
            {review.moderationReason && reviewStatus(review) !== "publicada" ? (
              <p className="mt-2 text-sm text-zinc-700">
                {review.moderationReason}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                className="text-zinc-600 underline"
                onClick={() =>
                  setEditingId((current) =>
                    current === review.id ? null : review.id,
                  )
                }
              >
                {editingId === review.id ? "Cerrar" : "Editar"}
              </button>
              {confirmingId === review.id ? (
                <>
                  <button
                    type="button"
                    className="text-red-700 underline"
                    disabled={busyId === review.id}
                    onClick={() => void remove(review.id)}
                  >
                    Confirmar eliminación
                  </button>
                  <button
                    type="button"
                    className="text-zinc-500 underline"
                    onClick={() => setConfirmingId(null)}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="text-zinc-600 underline"
                  onClick={() => setConfirmingId(review.id)}
                >
                  Eliminar
                </button>
              )}
            </div>
            {editingId === review.id ? (
              <AccountReviewEditor
                token={token}
                review={review}
                busy={busyId === review.id}
                onBusy={(busy) => setBusyId(busy ? review.id : null)}
                onSaved={() => {
                  setEditingId(null);
                  onReload();
                }}
                onError={onError}
              />
            ) : null}
            {decisions
              .filter((decision) => decision.reviewId === review.id)
              .map((decision) => (
                <div
                  key={decision.id}
                  className="mt-3 rounded-lg bg-stone-50 p-3 text-sm"
                >
                  <p className="font-medium">Decisión: {decision.status}</p>
                  <p className="mt-1 text-zinc-700">
                    {decision.decisionRule}: {decision.decisionReason}
                  </p>
                  {decision.appealedAt ? (
                    <p className="mt-2 text-xs text-sky-800">
                      Revisión solicitada.
                    </p>
                  ) : (
                    <div className="mt-3">
                      <textarea
                        value={appealReasons[decision.id] ?? ""}
                        onChange={(event) =>
                          onAppealReason(decision.id, event.target.value)
                        }
                        minLength={20}
                        maxLength={2000}
                        rows={3}
                        placeholder="Explica por qué debería revisarse"
                        className="input-field"
                      />
                      <button
                        type="button"
                        onClick={() => onAppeal(decision.id)}
                        className="mt-2 rounded-lg border border-stone-300 px-3 py-2 text-xs"
                      >
                        Solicitar revisión humana
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function reviewStatus(review: AccountReviewItem) {
  if (review.moderated && !review.flagged) return "publicada";
  if (review.flagged) return "retirada";
  return "retenida";
}

function AccountReviewEditor({
  token,
  review,
  busy,
  onBusy,
  onSaved,
  onError,
}: {
  token: string;
  review: AccountReviewItem;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title);
  const [pros, setPros] = useState(review.pros ?? "");
  const [cons, setCons] = useState(review.cons ?? "");
  const [anonymous, setAnonymous] = useState(review.anonymous);
  const [publicName, setPublicName] = useState(review.publicName ?? "");
  const [wouldRecommend, setWouldRecommend] = useState<"yes" | "no" | "skip">(
    review.wouldRecommend === true
      ? "yes"
      : review.wouldRecommend === false
        ? "no"
        : "skip",
  );
  const [marks, setMarks] = useState<IncidentMarks>(() => {
    const next: IncidentMarks = {};
    for (const tag of review.incidentTags) {
      next[tag] = review.incidentSentiments?.[tag] ?? "unset";
    }
    return next;
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      onError(WHOLE_NUMBER_RATING_ERROR);
      return;
    }
    const unsetTheme = unsetMarkMessage(marks);
    if (unsetTheme) {
      onError(unsetTheme);
      return;
    }
    onBusy(true);
    const sentiments = sentimentsFromMarks(marks);
    const res = await fetch(publicApiUrl(`/api/reviews/${review.id}`), {
      method: "PATCH",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating,
        title,
        pros,
        cons,
        anonymous,
        publicName: anonymous ? undefined : publicName,
        wouldRecommend:
          wouldRecommend === "skip" ? null : wouldRecommend === "yes",
        incidentTags: tagsFromSentiments(sentiments),
        incidentSentiments: sentiments,
      }),
    });
    const data = (await res.json()) as { error?: string };
    onBusy(false);
    if (!res.ok) {
      onError(data.error ?? "No se pudo guardar la reseña.");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-lg bg-stone-50 p-3">
      <p className="text-xs text-zinc-600">
        Si el texto no incluye una amenaza, un insulto o datos de otra persona,
        sigue en la ficha y consta como editada.
      </p>
      <label className="block text-xs font-medium text-zinc-600">
        Nota (1–5)
        <input
          type="number"
          min={1}
          max={5}
          step={1}
          required
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="input-field mt-1"
        />
      </label>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        maxLength={100}
        className="input-field"
      />
      <label className="block text-xs font-medium text-zinc-600">
        Ventajas
        <textarea
          value={pros}
          onChange={(event) => setPros(event.target.value)}
          required
          minLength={10}
          maxLength={450}
          rows={3}
          className="input-field mt-1"
        />
      </label>
      <label className="block text-xs font-medium text-zinc-600">
        Desventajas
        <textarea
          value={cons}
          onChange={(event) => setCons(event.target.value)}
          required
          minLength={10}
          maxLength={450}
          rows={3}
          className="input-field mt-1"
        />
      </label>
      <fieldset>
        <legend className="text-xs font-medium text-zinc-600">
          ¿Recomendarías esta inmobiliaria?
        </legend>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {(
            [
              ["yes", "Sí"],
              ["no", "No"],
              ["skip", "Prefiero no decirlo"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name={`wouldRecommend-${review.id}`}
                checked={wouldRecommend === value}
                onChange={() => setWouldRecommend(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-start gap-2 text-sm text-zinc-800">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
        />
        Publicar de forma anónima
      </label>
      {anonymous ? null : (
        <input
          value={publicName}
          onChange={(event) => setPublicName(event.target.value)}
          placeholder="Nombre público"
          maxLength={40}
          className="input-field"
        />
      )}
      <IncidentMarkFields marks={marks} onChange={setMarks} />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:opacity-60"
      >
        Guardar cambios
      </button>
    </form>
  );
}
