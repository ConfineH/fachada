"use client";

import { FormEvent, useState } from "react";

import { PhoneVerification } from "@/components/phone-verification";

type ReviewItem = {
  id: string;
  title: string;
  body: string;
  response?: { body: string; createdAt: string };
};

type Step = "verify" | "manage";

export function AgencyOwnerPanel({
  agencySlug,
  agencyVerified,
  reviews,
}: {
  agencySlug: string;
  agencyVerified: boolean;
  reviews: ReviewItem[];
}) {
  const [step, setStep] = useState<Step>("verify");
  const [token, setToken] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submittedReviewIds, setSubmittedReviewIds] = useState<string[]>([]);

  if (!agencyVerified) return null;

  const pendingReviews = reviews.filter(
    (review) => !review.response && !submittedReviewIds.includes(review.id),
  );

  async function checkAccess(sessionToken: string) {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/agencies/${agencySlug}/responses`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo comprobar el acceso");
      return;
    }

    setToken(sessionToken);
    setCanManage(Boolean(data.canManage));
    setStep("manage");
  }

  async function submitResponse(event: FormEvent, reviewId: string) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch(`/api/agencies/${agencySlug}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reviewId, body: responses[reviewId] ?? "" }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo publicar la respuesta");
      return;
    }

    setSubmittedReviewIds((current) => [...current, reviewId]);
    setMessage("Respuesta publicada. Recarga la página para verla en la reseña.");
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="font-medium text-emerald-950">Gestión de reseñas</h3>
      <p className="mt-1 text-sm text-emerald-900">
        Si eres el representante verificado de esta inmobiliaria, puedes responder
        a las reseñas publicadas.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {step === "verify" && (
        <div className="mt-4">
          <PhoneVerification
            onVerified={(sessionToken) => {
              void checkAccess(sessionToken);
            }}
          />
        </div>
      )}

      {step === "manage" && !canManage && (
        <p className="mt-4 text-sm text-emerald-900">
          No tienes permisos para gestionar este perfil. Reclama la agencia y
          espera la aprobación del administrador.
        </p>
      )}

      {step === "manage" && canManage && pendingReviews.length === 0 && (
        <p className="mt-4 text-sm text-emerald-900">
          No hay reseñas pendientes de respuesta.
        </p>
      )}

      {step === "manage" && canManage && pendingReviews.length > 0 && (
        <ul className="mt-4 space-y-4">
          {pendingReviews.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-emerald-200 bg-white p-4"
            >
              <p className="font-medium">{review.title}</p>
              <p className="mt-1 text-sm text-stone-600">{review.body}</p>
              <form
                onSubmit={(event) => submitResponse(event, review.id)}
                className="mt-3 space-y-2"
              >
                <textarea
                  value={responses[review.id] ?? ""}
                  onChange={(event) =>
                    setResponses((current) => ({
                      ...current,
                      [review.id]: event.target.value,
                    }))
                  }
                  placeholder="Escribe tu respuesta pública (máx. 500 caracteres)"
                  maxLength={500}
                  rows={3}
                  required
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
                <button
                  disabled={loading}
                  className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
                >
                  Publicar respuesta
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
