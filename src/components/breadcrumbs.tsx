import Link from "next/link";

import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ name: string; href: string }>;
}) {
  const schemaItems = [
    { name: "Inicio", path: "/" },
    ...items.map((item) => ({ name: item.name, path: item.href })),
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(schemaItems)} />
      <nav aria-label="Migas de pan" className="text-sm text-zinc-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-zinc-800">
              Inicio
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              <span aria-hidden>/</span>
              {index === items.length - 1 ? (
                <span className="text-zinc-700">{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-zinc-800">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
