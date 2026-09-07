"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({
  initialQuery = "",
  variant = "default",
}: {
  initialQuery?: string;
  variant?: "default" | "hero" | "explore";
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const base = variant === "explore" ? "/explorar" : "/";
    router.push(`${base}?${params.toString()}`);
  }

  if (variant === "hero") {
    return (
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm transition-[box-shadow,border-color] focus-within:border-zinc-300 focus-within:shadow-md sm:flex-row sm:items-center"
      >
        <label className="sr-only" htmlFor="hero-search">
          Nombre de la agencia o ciudad
        </label>
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre de la agencia o ciudad…"
          className="min-h-11 flex-1 rounded-xl border-0 bg-transparent px-4 text-base outline-none placeholder:text-zinc-400"
        />
        <button type="submit" className="btn-primary min-h-11 shrink-0 rounded-xl px-6">
          Buscar
        </button>
      </form>
    );
  }

  if (variant === "explore") {
    return (
      <form onSubmit={onSubmit} className="relative max-w-md">
        <label className="sr-only" htmlFor="explore-search">
          Buscar por ciudad o provincia
        </label>
        <input
          id="explore-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por ciudad o provincia…"
          className="input-field min-h-11 rounded-full pl-5"
        />
        <button
          type="submit"
          className="btn-primary absolute right-1.5 top-1.5 min-h-9 rounded-full px-4 text-xs"
        >
          Buscar
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nombre o ciudad (ej. Madrid, Sol…)"
        className="input-field min-h-11 flex-1"
      />
      <button type="submit" className="btn-primary min-h-11 px-6">
        Buscar
      </button>
    </form>
  );
}
