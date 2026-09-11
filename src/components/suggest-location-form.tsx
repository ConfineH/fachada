"use client";

import { FormEvent, useEffect, useState } from "react";

import { AccountVerification } from "@/components/account-verification";
import {
  readSessionToken,
  writeSessionToken,
} from "@/lib/auth/session-client";

export function SuggestLocationForm({ agencySlug }: { agencySlug: string }) {
  const [token, setToken] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Madrid");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");
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
      setError("Identifícate para sugerir una ubicación.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/agencies/${agencySlug}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address,
        city,
        postalCode,
        note: note.trim() || undefined,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la ubicación");
      return;
    }
    setAddress("");
    setNote("");
    setMessage("La miramos en moderación antes de publicarla.");
  }

  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-5">
      <h3 className="font-medium">¿No es ahí donde están?</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Si has ido a otra oficina, o el domicilio del anuncio no cuadra,
        cuéntanoslo. No se publica hasta que lo revisemos.
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
            Dirección
            <input
              required
              value={address}
              onChange={(event) => setAddress(event.target.value)}
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
          <label className="block text-sm">
            Cómo lo sabes (opcional)
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Visité esta oficina, sale en el contrato…"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-800">{message}</p> : null}
          <button
            disabled={loading}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Sugerir ubicación"}
          </button>
        </form>
      )}
    </div>
  );
}
