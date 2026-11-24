"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import styles from "./portada.module.css";

export function ArchiveSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    const search = params.toString();
    router.push(search ? `/agencias?${search}` : "/agencias");
  }

  return (
    <form
      className={styles.search}
      action="/agencias"
      method="get"
      onSubmit={onSubmit}
      role="search"
    >
      <label className={styles.label} htmlFor="archive-search">
        Inmobiliaria o ciudad
      </label>
      <div className={styles.controls}>
        <input
          id="archive-search"
          className={styles.input}
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre o ciudad"
          autoComplete="off"
          enterKeyHint="search"
        />
        <button className={styles.button} type="submit">
          Buscar
        </button>
      </div>
    </form>
  );
}
