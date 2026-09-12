"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AccountVerification } from "@/components/account-verification";
import {
  authHeaders,
  clearSessionToken,
  readSessionToken,
  writeSessionToken,
} from "@/lib/auth/session-client";

type Dashboard = {
  user: { email?: string; emailVerified: boolean; phoneVerified: boolean };
  reviews: {
    id: string;
    title: string;
    rating: number;
    moderated: boolean;
    flagged: boolean;
    createdAt: string;
    agency: { name: string; slug: string } | null;
  }[];
  saved: { id: string; name: string; slug: string; city: string }[];
  claimedAgencies: { name: string; slug: string }[];
  moderationDecisions: {
    id: string;
    reviewId: string;
    status: string;
    decisionRule?: string;
    decisionReason?: string;
    appealedAt?: string;
  }[];
};

export function AccountHome({ privacyEmail }: { privacyEmail: string }) {
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [appealReasons, setAppealReasons] = useState<Record<string, string>>({});

  async function load(sessionToken: string) {
    const res = await fetch("/api/me", { headers: authHeaders(sessionToken) });
    if (res.status === 401) {
      clearSessionToken();
      setToken("");
      setDashboard(null);
      return;
    }
    if (!res.ok) {
      setError("No se pudo cargar la cuenta.");
      return;
    }
    setDashboard((await res.json()) as Dashboard);
  }

  useEffect(() => {
    const stored = readSessionToken();
    if (!stored) return;
    setToken(stored);
    void load(stored);
  }, []);

  function onVerified(sessionToken: string) {
    writeSessionToken(sessionToken);
    setToken(sessionToken);
    setError("");
    void load(sessionToken);
  }

  async function unsave(agencyId: string) {
    const res = await fetch(`/api/me/saved-agencies?agencyId=${agencyId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (res.ok) void load(token);
  }

  async function exportData() {
    const res = await fetch("/api/me/export", {
      headers: authHeaders(token),
    });
    if (!res.ok) {
      setError("No se pudo preparar la exportación.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fachada-datos.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function appeal(noticeId: string) {
    const res = await fetch(`/api/content-notices/${noticeId}/appeal`, {
      method: "POST",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appealReason: appealReasons[noticeId] }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "No se pudo solicitar la revisión.");
      return;
    }
    await load(token);
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tu cuenta</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Entra con Google o un código al correo para ver tus reseñas y las
          inmobiliarias guardadas.
        </p>
        <div className="mt-4">
          <AccountVerification onVerified={onVerified} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tu cuenta</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {dashboard?.user.email
            ? `Sesión: ${dashboard.user.email}`
            : "Sesión identificada."}{" "}
          El correo no se publica en las fichas.
        </p>
        <button
          type="button"
          className="mt-3 text-sm text-zinc-600 underline"
          onClick={() => {
            clearSessionToken();
            setToken("");
            setDashboard(null);
          }}
        >
          Cerrar sesión en este navegador
        </button>
      </header>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {dashboard?.claimedAgencies.length ? (
        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium">Fichas reclamadas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {dashboard.claimedAgencies.map((agency) => (
              <li key={agency.slug}>
                <Link href={`/agencia/${agency.slug}/panel`} className="link-brand">
                  Panel de {agency.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-medium">Tus reseñas</h2>
        {dashboard && dashboard.reviews.length === 0 && (
          <p className="mt-2 text-sm text-zinc-600">Aún no has enviado reseñas.</p>
        )}
        <ul className="mt-3 space-y-3">
          {dashboard?.reviews.map((review) => (
            <li key={review.id} className="border-t border-stone-100 pt-3 first:border-0 first:pt-0">
              <p className="font-medium">{review.title}</p>
              <p className="text-sm text-zinc-600">
                {review.agency ? (
                  <Link href={`/agencias/${review.agency.slug}`} className="link-brand">
                    {review.agency.name}
                  </Link>
                ) : (
                  "Inmobiliaria"
                )}{" "}
                · {review.rating}/5 ·{" "}
                {review.flagged
                  ? "retirada"
                  : review.moderated
                    ? "publicada"
                    : "pendiente de moderación"}
              </p>
              {dashboard.moderationDecisions
                .filter((decision) => decision.reviewId === review.id)
                .map((decision) => (
                  <div
                    key={decision.id}
                    className="mt-3 rounded-lg bg-stone-50 p-3 text-sm"
                  >
                    <p className="font-medium">
                      Decisión: {decision.status}
                    </p>
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
                            setAppealReasons((current) => ({
                              ...current,
                              [decision.id]: event.target.value,
                            }))
                          }
                          minLength={20}
                          maxLength={2000}
                          rows={3}
                          placeholder="Explica por qué debería revisarse"
                          className="input-field"
                        />
                        <button
                          type="button"
                          onClick={() => appeal(decision.id)}
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

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-medium">Tus datos y derechos</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Descarga una copia estructurada o solicita acceso, rectificación,
          supresión, oposición, limitación o portabilidad. La supresión se
          evalúa caso por caso cuando afecte a contenido publicado.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportData}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            Exportar mis datos
          </button>
          <a
            href={`mailto:${privacyEmail}?subject=${encodeURIComponent(
              "Ejercicio de derechos RGPD",
            )}`}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            Solicitar un derecho
          </a>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-medium">Inmobiliarias guardadas</h2>
        {dashboard && dashboard.saved.length === 0 && (
          <p className="mt-2 text-sm text-zinc-600">
            Guarda fichas desde la página de la inmobiliaria.
          </p>
        )}
        <ul className="mt-3 space-y-3">
          {dashboard?.saved.map((agency) => (
            <li
              key={agency.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <Link href={`/agencias/${agency.slug}`} className="link-brand">
                {agency.name} · {agency.city}
              </Link>
              <button
                type="button"
                className="text-zinc-500 underline"
                onClick={() => unsave(agency.id)}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
