import type { ClientPrice } from "./types";

export type PriceIndex = Map<string, ClientPrice[]>;

function key(clientId: string, productId: string): string {
  return `${clientId}:${productId}`;
}

export function buildPriceIndex(prices: ClientPrice[]): PriceIndex {
  const index: PriceIndex = new Map();
  for (const price of prices) {
    const itemKey = key(price.clientId, price.productId);
    const list = index.get(itemKey);
    if (list) list.push(price);
    else index.set(itemKey, [price]);
  }
  return index;
}

// Harga yang berlaku untuk klien+produk pada tanggal tertentu:
// baris dengan effective_from <= dateISO yang paling baru. null = pakai harga dasar.
export function resolveClientPrice(
  index: PriceIndex,
  clientId: string,
  productId: string,
  dateISO: string
): number | null {
  const list = index.get(key(clientId, productId));
  if (!list) return null;
  let best: ClientPrice | null = null;
  for (const entry of list) {
    if (entry.effectiveFrom > dateISO) continue;
    if (!best || entry.effectiveFrom > best.effectiveFrom) best = entry;
  }
  return best ? best.price : null;
}

export function priceHistory(
  index: PriceIndex,
  clientId: string,
  productId: string
): ClientPrice[] {
  return [...(index.get(key(clientId, productId)) ?? [])].sort((a, b) =>
    a.effectiveFrom < b.effectiveFrom ? 1 : a.effectiveFrom > b.effectiveFrom ? -1 : 0
  );
}
