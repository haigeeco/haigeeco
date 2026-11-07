import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ name: string; href: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="font-medium text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="transition hover:text-pistachio">
                    {item.name}
                  </Link>
                  <span aria-hidden className="text-line">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
