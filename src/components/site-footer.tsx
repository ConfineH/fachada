import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-lg font-bold tracking-tight">FACHADA</p>
            <p className="mt-3 max-w-sm text-sm text-zinc-600">
              Archivo independiente de reputación inmobiliaria. Transparencia
              pública y verificación sistemática.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Institucional
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              <li>
                <Link href="/sobre" className="hover:text-brand">
                  Sobre Fachada
                </Link>
              </li>
              <li>
                <Link href="/metodologia" className="hover:text-brand">
                  Metodología de verificación
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              <li>
                <Link href="/legal/aviso-legal" className="hover:text-brand">
                  LSSI
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="hover:text-brand">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-6 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Fachada. Todos los derechos reservados.</p>
          <p className="font-semibold uppercase tracking-wider text-zinc-400">
            Repositorio público
          </p>
        </div>
      </div>
    </footer>
  );
}
