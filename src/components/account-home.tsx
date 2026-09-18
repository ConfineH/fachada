"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AccountReviews } from "@/components/account-reviews";
import { AccountVerification } from "@/components/account-verification";
import { AgencyLogo } from "@/components/agency-logo";
import {
  authHeaders,
  clearSessionToken,
  readSessionToken,
  writeSessionToken,
} from "@/lib/auth/session-client";
import type { IncidentTag } from "@/lib/domain/incidents";

type Dashboard = {
  user: { email?: string; emailVerified: boolean; phoneVerified: boolean };
  reviews: {
    id: string;
    title: string;
    rating: number;
    pros?: string;
    cons?: string;
    anonymous: boolean;
    publicName?: string;
    wouldRecommend?: boolean;
    incidentTags: IncidentTag[];
    moderated: boolean;
    flagged: boolean;
    createdAt: string;
    editedAt?: string;
    agency: { name: string; slug: string } | null;
  }[];
  saved: { id: string; name: string; slug: string; city: string; logoUrl?: string }[];
  claimedAgencies: { name: string; slug: string; logoUrl?: string }[];
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
              <li key={agency.slug} className="flex items-center gap-2">
                <AgencyLogo name={agency.name} src={agency.logoUrl} size="sm" />
                <Link href={`/agencia/${agency.slug}/panel`} className="link-brand">
                  Panel de {agency.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AccountReviews
        token={token}
        reviews={dashboard?.reviews ?? []}
        decisions={dashboard?.moderationDecisions ?? []}
        appealReasons={appealReasons}
        onAppealReason={(id, value) =>
          setAppealReasons((current) => ({ ...current, [id]: value }))
        }
        onAppeal={(id) => void appeal(id)}
        onReload={() => void load(token)}
        onError={setError}
      />

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
          {privacyEmail.includes("@") ? (
            <a
              href={`mailto:${privacyEmail}?subject=${encodeURIComponent(
                "Ejercicio de derechos RGPD",
              )}`}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              Solicitar un derecho
            </a>
          ) : (
            <a
              href="/legal/aviso-legal"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              Solicitar un derecho
            </a>
          )}
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
              <Link href={`/agencias/${agency.slug}`} className="flex items-center gap-2 link-brand">
                <AgencyLogo name={agency.name} src={agency.logoUrl} size="sm" />
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
