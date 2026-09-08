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
};

export function AccountHome() {
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

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

  if (!token) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tu cuenta</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Entra con Google o un código al email para ver tus reseñas y las
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
            </li>
          ))}
        </ul>
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
