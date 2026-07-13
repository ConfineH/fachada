"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nombre o ciudad (ej. Madrid, Sol...)"
        className="flex-1 rounded-lg border border-stone-300 px-4 py-3 text-base outline-none focus:border-amber-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-amber-700 px-5 py-3 font-medium text-white hover:bg-amber-800"
      >
        Buscar
      </button>
    </form>
  );
}
