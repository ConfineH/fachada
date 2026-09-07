import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-900"
        >
          FACHADA
        </Link>
        <div className="col-span-2 flex flex-wrap items-center gap-6 lg:col-span-1 lg:justify-center">
          <Link href="/explorar" className="nav-link">
            Explorar ciudades
          </Link>
          <Link href="/agregar-inmobiliaria" className="nav-link">
            Añadir inmobiliaria
          </Link>
        </div>
        <div className="flex items-center justify-end gap-3 lg:col-start-3">
          <Link href="/agencia/acceso" className="btn-secondary hidden min-h-10 sm:inline-flex">
            Acceso agencias
          </Link>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-xs font-medium text-zinc-400"
            aria-hidden
          >
            ·
          </span>
        </div>
      </div>
    </nav>
  );
}
