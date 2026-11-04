import { describe, expect, it } from "vitest";
import { buildPriceIndex, priceHistory, resolveClientPrice } from "./pricing";
import type { ClientPrice } from "./types";

function price(
  clientId: string,
  productId: string,
  value: number,
  effectiveFrom: string
): ClientPrice {
  return {
    id: `${clientId}-${productId}-${effectiveFrom}`,
    clientId,
    productId,
    price: value,
    effectiveFrom,
    createdAt: effectiveFrom,
    updatedAt: effectiveFrom,
  };
}

const index = buildPriceIndex([
  price("c1", "p1", 20_000, "2026-11-01"),
  price("c1", "p1", 21_000, "2026-12-01"),
  price("c2", "p1", 18_000, "2026-11-01"),
]);

describe("resolveClientPrice", () => {
  it("mengembalikan null bila tidak ada harga khusus", () => {
    expect(resolveClientPrice(index, "c1", "p2", "2026-11-15")).toBeNull();
    expect(resolveClientPrice(index, "c3", "p1", "2026-11-15")).toBeNull();
  });

  it("memakai harga yang berlaku pada tanggal invoice", () => {
    expect(resolveClientPrice(index, "c1", "p1", "2026-11-15")).toBe(20_000);
    expect(resolveClientPrice(index, "c1", "p1", "2026-12-15")).toBe(21_000);
  });

  it("memakai harga baru tepat pada tanggal berlaku", () => {
    expect(resolveClientPrice(index, "c1", "p1", "2026-12-01")).toBe(21_000);
    expect(resolveClientPrice(index, "c1", "p1", "2026-11-30")).toBe(20_000);
  });

  it("tidak memakai harga yang belum berlaku", () => {
    expect(resolveClientPrice(index, "c1", "p1", "2026-10-31")).toBeNull();
  });

  it("memisahkan harga antar klien", () => {
    expect(resolveClientPrice(index, "c2", "p1", "2026-11-15")).toBe(18_000);
  });
});

describe("priceHistory", () => {
  it("mengurutkan dari yang terbaru", () => {
    const history = priceHistory(index, "c1", "p1");
    expect(history.map((entry) => entry.effectiveFrom)).toEqual(["2026-12-01", "2026-11-01"]);
  });
});
