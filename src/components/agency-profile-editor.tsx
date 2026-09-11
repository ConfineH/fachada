"use client";

import { FormEvent, useState } from "react";

export function AgencyProfileEditor({
  agencySlug,
  token,
  website,
  googleMapsUrl,
  idealistaUrl,
  fotocasaUrl,
}: {
  agencySlug: string;
  token: string;
  website?: string;
  googleMapsUrl?: string;
  idealistaUrl?: string;
  fotocasaUrl?: string;
}) {
  const [websiteValue, setWebsiteValue] = useState(website ?? "");
  const [mapsValue, setMapsValue] = useState(googleMapsUrl ?? "");
  const [idealistaValue, setIdealistaValue] = useState(idealistaUrl ?? "");
  const [fotocasaValue, setFotocasaValue] = useState(fotocasaUrl ?? "");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch(`/api/agencies/${agencySlug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        website: websiteValue.trim(),
        googleMapsUrl: mapsValue.trim(),
        idealistaUrl: idealistaValue.trim(),
        fotocasaUrl: fotocasaValue.trim(),
        alias: alias.trim() || undefined,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar la ficha");
      return;
    }

    setAlias("");
    setMessage("Ficha actualizada.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-stone-200 bg-white p-5"
    >
      <h3 className="font-medium">Datos públicos de la ficha</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Enlaces de portales y un alias comercial. El nombre legal lo valida
        moderación.
      </p>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      <div className="mt-4 space-y-3">
        <label className="block text-xs text-zinc-500">
          Web
          <input
            value={websiteValue}
            onChange={(e) => setWebsiteValue(e.target.value)}
            placeholder="https://"
            className="input-field mt-1"
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Google Maps
          <input
            value={mapsValue}
            onChange={(e) => setMapsValue(e.target.value)}
            placeholder="https://maps.google.com/..."
            className="input-field mt-1"
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Idealista
          <input
            value={idealistaValue}
            onChange={(e) => setIdealistaValue(e.target.value)}
            placeholder="https://www.idealista.com/..."
            className="input-field mt-1"
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Fotocasa
          <input
            value={fotocasaValue}
            onChange={(e) => setFotocasaValue(e.target.value)}
            placeholder="https://www.fotocasa.es/..."
            className="input-field mt-1"
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Añadir alias comercial
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Nombre en portales"
            maxLength={80}
            className="input-field mt-1"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-4 min-h-10 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

export function AgencyAddOfficeForm({
  agencySlug,
  token,
}: {
  agencySlug: string;
  token: string;
}) {
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/agencies/${agencySlug}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        address,
        city: "Madrid",
        label: label.trim() || undefined,
        kind: "branch",
      }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo añadir la oficina");
      return;
    }
    setAddress("");
    setLabel("");
    setMessage("Oficina publicada en la ficha.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 rounded-xl border border-stone-200 bg-white p-5"
    >
      <h3 className="font-medium">Otra oficina</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Si atendéis en más de un local, añádelo aquí. Sale en «dónde
        encontrarlos».
      </p>
      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      <label className="mt-4 block text-xs text-zinc-500">
        Etiqueta
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Chamberí, local 2…"
          className="input-field mt-1"
        />
      </label>
      <label className="mt-3 block text-xs text-zinc-500">
        Dirección
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-field mt-1"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-4 min-h-10 disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Añadir oficina"}
      </button>
    </form>
  );
}
