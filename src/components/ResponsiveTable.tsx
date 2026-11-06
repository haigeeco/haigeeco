"use client";

import type { ReactNode } from "react";

export function ResponsiveTable<T>({
  items,
  head,
  renderRow,
  renderCard,
  getKey,
  minWidth = "min-w-[680px]",
}: {
  items: T[];
  head: ReactNode;
  renderRow: (item: T) => ReactNode;
  renderCard: (item: T) => ReactNode;
  getKey: (item: T) => string;
  minWidth?: string;
}) {
  return (
    <>
      <ul className="divide-y divide-slate-100 sm:hidden">
        {items.map((item) => (
          <li key={getKey(item)} className="p-4">
            {renderCard(item)}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
        <table className={`w-full ${minWidth} border-collapse text-sm`}>
          <thead>{head}</thead>
          <tbody>{items.map((item) => renderRow(item))}</tbody>
        </table>
      </div>
    </>
  );
}
