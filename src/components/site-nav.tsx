import Link from "next/link";

import { FachadaMark } from "@/components/fachada-mark";

export function SiteNav() {
  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 sm:flex sm:flex-wrap sm:gap-x-6 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-zinc-900"
        >
          <FachadaMark className="h-7 w-auto shrink-0" />
          FACHADA
        </Link>
        <Link
          href="/cuenta"
          className="btn-secondary col-start-2 row-start-1 inline-flex min-h-11 items-center justify-self-end px-3 sm:order-3 sm:ml-auto"
        >
          Cuenta
        </Link>
        <div className="col-span-2 flex items-center gap-x-5 sm:order-2 sm:col-auto">
          <Link href="/inquilinos" className="nav-link min-h-11">
            Buscar
          </Link>
          <Link href="/inquilinos#buscar" className="nav-link min-h-11">
            Contar experiencia
          </Link>
        </div>
      </div>
    </nav>
  );
}
