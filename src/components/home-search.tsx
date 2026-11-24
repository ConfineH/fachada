"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import styles from "@/app/home.module.css";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    const search = params.toString();
    router.push(search ? `/inquilinos?${search}` : "/inquilinos");
  }

  return (
    <form
      className={styles.search}
      action="/inquilinos"
      method="get"
      onSubmit={onSubmit}
      role="search"
    >
      <label className={styles.label} htmlFor="home-search">
        Inmobiliaria o ciudad
      </label>
      <div className={styles.controls}>
        <input
          id="home-search"
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
