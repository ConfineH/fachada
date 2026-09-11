"use client";

import { useState } from "react";

export function AdminCreateAgencyForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const aliases = String(data.get("aliases") ?? "")
      .split(/\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-agency",
        agency: {
          name: data.get("name"),
          city: data.get("city") || "Madrid",
          postalCode: data.get("postalCode"),
          address: data.get("address"),
          noPhoneOnline: true,
          website: String(data.get("website") ?? "").trim() || undefined,
          idealistaUrl: String(data.get("idealistaUrl") ?? "").trim() || undefined,
          aliases,
        },
      }),
    });

    const payload = await res.json();
    setPending(false);
    if (!res.ok) {
      setMessage(payload.error ?? "No se pudo crear la ficha");
      return;
    }

    form.reset();
    setMessage(`Publicada: ${payload.agency?.name} (${payload.agency?.slug})`);
  }

  return (
    <section>
      <h2 className="text-lg font-medium">Alta rápida (Madrid)</h2>
      <p className="mt-1 text-sm text-stone-600">
        Para fichas que no salgan del catálogo piloto. Sin teléfono público. Un
        alias por línea ayuda al match de Idealista.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-xl border border-stone-200 bg-white p-5 md:grid-cols-2">
        <label className="text-sm">
          Nombre
          <input required name="name" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          Ciudad
          <input name="city" defaultValue="Madrid" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          Dirección
          <input required name="address" placeholder="Calle y número, o «Oficina en Madrid»" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          CP
          <input required name="postalCode" defaultValue="28001" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          Web
          <input name="website" type="url" placeholder="https://" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          URL Idealista (si la tienes)
          <input name="idealistaUrl" type="url" placeholder="https://www.idealista.com/pro/..." className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="text-sm md:col-span-2">
          Aliases (uno por línea)
          <textarea name="aliases" rows={3} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <div className="md:col-span-2">
          <button
            disabled={pending}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending ? "Publicando…" : "Publicar ficha"}
          </button>
          {message ? <p className="mt-2 text-sm text-stone-700">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}

export function AdminMatchProbe() {
  const [name, setName] = useState("");
  const [result, setResult] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const query = name.trim();
    if (!query) return;

    const url = `/api/agencies/match?name=${encodeURIComponent(query)}&city=Madrid`;
    const res = await fetch(url);
    const payload = await res.json();
    if (!res.ok) {
      setResult(payload.error ?? "Error");
      return;
    }
    if (!payload.match) {
      setResult(`Sin match (< 0.45): «${query}»`);
      return;
    }
    setResult(
      `${payload.match.name} · ${payload.match.slug} · conf ${Number(payload.match.confidence).toFixed(2)}`,
    );
  }

  return (
    <section>
      <h2 className="text-lg font-medium">Probar match Idealista</h2>
      <p className="mt-1 text-sm text-stone-600">
        Pega el nombre tal como sale en el anuncio. Si falla, añade un alias en
        alta rápida o en SQL.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tecnocasa Fuencarral"
          className="min-w-64 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <button className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm">
          Probar
        </button>
      </form>
      {result ? <p className="mt-2 text-sm text-stone-800">{result}</p> : null}
    </section>
  );
}

export function AdminAddAliasForm() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-alias",
        slug: data.get("slug"),
        alias: data.get("alias"),
        kind: data.get("kind") || "commercial",
        note: String(data.get("note") ?? "").trim() || undefined,
      }),
    });
    const payload = await res.json();
    if (!res.ok) {
      setMessage(payload.error ?? "No se pudo guardar el alias");
      return;
    }
    form.reset();
    setMessage(`Alias guardado: ${payload.alias?.alias}`);
  }

  return (
    <section>
      <h2 className="text-lg font-medium">Alias o nombre anterior</h2>
      <p className="mt-1 text-sm text-stone-600">
        Match de Idealista, o historial si la empresa cambió de nombre.
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-wrap gap-2 rounded-xl border border-dashed border-stone-300 bg-white p-4">
      <input
        required
        name="slug"
        placeholder="tecnocasa-madrid"
        className="min-w-64 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
      />
      <input
        required
        name="alias"
        placeholder="Nombre"
        className="min-w-48 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
      />
      <select name="kind" defaultValue="commercial" className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
        <option value="commercial">En anuncios (match)</option>
        <option value="former">Nombre anterior</option>
        <option value="legal">Nombre legal</option>
      </select>
      <input
        name="note"
        placeholder="Nota (hasta 2019…)"
        className="min-w-40 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
      />
      <button className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
        Añadir alias
      </button>
      {message ? <p className="w-full text-sm text-stone-700">{message}</p> : null}
    </form>
    </section>
  );
}

export function AdminCreateLocationForm() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-location",
        location: {
          slug: data.get("slug"),
          kind: data.get("kind") || "reported",
          address: data.get("address"),
          city: data.get("city") || "Madrid",
          postalCode: data.get("postalCode") || "",
          label: String(data.get("label") ?? "").trim() || undefined,
          note: String(data.get("note") ?? "").trim() || undefined,
        },
      }),
    });
    const payload = await res.json();
    if (!res.ok) {
      setMessage(payload.error ?? "No se pudo guardar la ubicación");
      return;
    }
    form.reset();
    setMessage("Ubicación publicada");
  }

  return (
    <section>
      <h2 className="text-lg font-medium">Añadir ubicación</h2>
      <p className="mt-1 text-sm text-stone-600">
        Oficina extra o sitio donde de verdad atienden (caso Alamo Foro).
      </p>
      <form onSubmit={onSubmit} className="mt-3 grid gap-2 rounded-xl border border-dashed border-stone-300 bg-white p-4 md:grid-cols-2">
        <input required name="slug" placeholder="alamo-foro-s-l-madrid" className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <select name="kind" defaultValue="reported" className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
          <option value="reported">Ubicación observada</option>
          <option value="branch">Otra oficina</option>
        </select>
        <input required name="address" placeholder="Calle y número" className="rounded-lg border border-stone-300 px-3 py-2 text-sm md:col-span-2" />
        <input name="city" defaultValue="Madrid" className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <input name="postalCode" placeholder="CP" className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <input name="label" placeholder="Etiqueta (Chamberí, local 2…)" className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <input name="note" placeholder="Nota" className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <div className="md:col-span-2">
          <button className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
            Publicar ubicación
          </button>
          {message ? <p className="mt-2 text-sm text-stone-700">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
