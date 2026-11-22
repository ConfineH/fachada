import Link from "next/link";

import { FachadaMark } from "@/components/fachada-mark";

export function SiteNav() {
  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-zinc-900"
        >
          <FachadaMark className="h-7 w-auto shrink-0" />
          FACHADA
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/inquilinos" className="nav-link min-h-11">
            Buscar
          </Link>
          <Link href="/inquilinos#buscar" className="nav-link min-h-11">
            Contar experiencia
          </Link>
        </div>
        <Link href="/cuenta" className="btn-secondary ml-auto min-h-11 px-3">
          Cuenta
        </Link>
      </div>
    </nav>
  );
}
