"use client";

import { FormEvent, useEffect, useState } from "react";

import { AccountVerification } from "@/components/account-verification";
import {
  AGENCY_TIP_KIND_LABELS,
  AGENCY_TIP_KINDS,
  isLocationTip,
  isNameTip,
} from "@/lib/domain/agency-tips";
import type { AgencyTipKind } from "@/lib/domain/types";
import {
  readSessionToken,
  writeSessionToken,
} from "@/lib/auth/session-client";

export function SuggestFichaTipForm({
  agencySlug,
  agencyCity,
}: {
  agencySlug: string;
  agencyCity: string;
}) {
  const [token, setToken] = useState("");
  const [kind, setKind] = useState<AgencyTipKind>("principal");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(agencyCity);
  const [postalCode, setPostalCode] = useState("");
  const [label, setLabel] = useState("");
  const [alias, setAlias] = useState("");
  const [year, setYear] = useState("");
  const [note, setNote] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = readSessionToken();
    if (stored) setToken(stored);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Identifícate para aportar un dato.");
      return;
    }
    setLoading(true);

    const form = new FormData();
    form.set("kind", kind);
    if (isLocationTip(kind)) {
      form.set("address", address);
      form.set("city", city);
      form.set("postalCode", postalCode);
      if (label.trim()) form.set("label", label.trim());
    }
    if (isNameTip(kind)) {
      form.set("alias", alias);
      if (year.trim()) form.set("year", year.trim());
    }
    if (note.trim()) form.set("note", note.trim());
    if (sourceUrl.trim()) form.set("sourceUrl", sourceUrl.trim());
    if (evidence) form.set("evidence", evidence);

    const res = await fetch(`/api/agencies/${agencySlug}/tips`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = (await res.json()) as { error?: string; pending?: boolean };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar");
      return;
    }
    setAddress("");
    setLabel("");
    setAlias("");
    setYear("");
    setNote("");
    setSourceUrl("");
    setEvidence(null);
    setMessage(
      data.pending
        ? "Lo miramos en moderación antes de publicarlo."
        : "Publicado en la ficha.",
    );
  }

  return (
    <div
      id="aportar-dato"
      className="rounded-xl border border-dashed border-stone-300 bg-white p-5"
    >
      <h3 className="font-medium">¿Ves algo que no cuadra?</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Oficina, nombre anterior, razón social. Vale solo el dato; un enlace o
        una captura ayuda a publicarlo antes.
      </p>
      {!token ? (
        <div className="mt-4">
          <AccountVerification
            onVerified={(sessionToken) => {
              writeSessionToken(sessionToken);
              setToken(sessionToken);
            }}
          />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block text-sm">
            Qué aportas
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as AgencyTipKind)
              }
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            >
              {AGENCY_TIP_KINDS.map((item) => (
                <option key={item} value={item}>
                  {AGENCY_TIP_KIND_LABELS[item]}
                </option>
              ))}
            </select>
          </label>

          {isLocationTip(kind) ? (
            <>
              <label className="block text-sm">
                Dirección
                <input
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Calle y número"
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  Ciudad
                  <input
                    required
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  CP
                  <input
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </label>
              </div>
              {kind === "branch" ? (
                <label className="block text-sm">
                  Cómo la llamáis (opcional)
                  <input
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="Chamberí, local 2…"
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </label>
              ) : null}
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                Nombre
                <input
                  required
                  value={alias}
                  onChange={(event) => setAlias(event.target.value)}
                  placeholder={
                    kind === "legal_name"
                      ? "Razón social o CIF en el papel"
                      : "Cómo se llamaban antes"
                  }
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                />
              </label>
              {kind === "former_name" ? (
                <label className="block text-sm">
                  Hasta el año (opcional)
                  <input
                    inputMode="numeric"
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    placeholder="2019"
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                  />
                </label>
              ) : null}
            </div>
          )}

          <label className="block text-sm">
            Cómo lo sabes (opcional)
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Sale en el contrato, estuve en esa oficina…"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Enlace (opcional)
            <input
              type="url"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="Google Maps, anuncio, registro…"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Captura (opcional)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) =>
                setEvidence(event.target.files?.[0] ?? null)
              }
              className="mt-1 w-full text-sm"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? (
            <p className="text-sm text-emerald-800">{message}</p>
          ) : null}
          <button
            disabled={loading}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar aporte"}
          </button>
        </form>
      )}
    </div>
  );
}
