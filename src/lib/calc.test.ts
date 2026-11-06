import { describe, expect, it } from "vitest";
import { computeTotals, lineDiscountValue, lineTotal } from "./calc";
import type { InvoiceItem } from "./types";

function item(partial: Partial<InvoiceItem>): InvoiceItem {
  return {
    id: "item",
    productId: null,
    description: "",
    unit: "",
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    ...partial,
  };
}

describe("lineTotal", () => {
  it("menghitung harga dikali kuantitas", () => {
    expect(lineTotal(item({ quantity: 3, unitPrice: 25_000 }))).toBe(75_000);
  });

  it("menerapkan diskon per item", () => {
    const line = item({ quantity: 1, unitPrice: 100_000, discountPercent: 10 });
    expect(lineDiscountValue(line)).toBe(10_000);
    expect(lineTotal(line)).toBe(90_000);
  });

  it("membulatkan total baris ke rupiah bulat", () => {
    expect(lineTotal(item({ quantity: 1.5, unitPrice: 999 }))).toBe(1_499);
  });
});

describe("computeTotals", () => {
  it("menjumlahkan subtotal dari seluruh item", () => {
    const totals = computeTotals({
      items: [item({ quantity: 2, unitPrice: 100_000 }), item({ quantity: 1, unitPrice: 50_000 })],
      discount: 0,
      shippingCost: 0,
      taxEnabled: false,
      taxRate: 0,
      downPayment: 0,
    });
    expect(totals.subtotal).toBe(250_000);
    expect(totals.total).toBe(250_000);
  });

  it("mengurangi diskon invoice dan menambah ongkir", () => {
    const totals = computeTotals({
      items: [item({ quantity: 2, unitPrice: 100_000 })],
      discount: 50_000,
      shippingCost: 20_000,
      taxEnabled: false,
      taxRate: 0,
      downPayment: 0,
    });
    expect(totals.netBeforeTax).toBe(170_000);
    expect(totals.total).toBe(170_000);
  });

  it("menghitung pajak saat diaktifkan", () => {
    const totals = computeTotals({
      items: [item({ quantity: 2, unitPrice: 100_000 })],
      discount: 50_000,
      shippingCost: 20_000,
      taxEnabled: true,
      taxRate: 11,
      downPayment: 0,
    });
    expect(totals.taxAmount).toBeCloseTo(18_700, 5);
    expect(totals.total).toBeCloseTo(188_700, 5);
  });

  it("tidak menghitung pajak saat dinonaktifkan", () => {
    const totals = computeTotals({
      items: [item({ quantity: 1, unitPrice: 100_000 })],
      discount: 0,
      shippingCost: 0,
      taxEnabled: false,
      taxRate: 11,
      downPayment: 0,
    });
    expect(totals.taxAmount).toBe(0);
  });

  it("mengurangi uang muka dari total", () => {
    const totals = computeTotals({
      items: [item({ quantity: 1, unitPrice: 100_000 })],
      discount: 0,
      shippingCost: 0,
      taxEnabled: false,
      taxRate: 0,
      downPayment: 40_000,
    });
    expect(totals.amountDue).toBe(60_000);
  });

  it("membulatkan pajak sehingga subtotal + pajak = total", () => {
    const totals = computeTotals({
      items: [item({ quantity: 1, unitPrice: 999 })],
      discount: 0,
      shippingCost: 0,
      taxEnabled: true,
      taxRate: 11,
      downPayment: 0,
    });
    expect(totals.taxAmount).toBe(110);
    expect(totals.subtotal + totals.taxAmount).toBe(totals.total);
    expect(totals.total).toBe(1_109);
  });

  it("selalu menghasilkan angka bulat (rupiah)", () => {
    const totals = computeTotals({
      items: [item({ quantity: 3, unitPrice: 33_333.5 })],
      discount: 1_000.4,
      shippingCost: 2_500.6,
      taxEnabled: true,
      taxRate: 11,
      downPayment: 500.5,
    });
    for (const value of Object.values(totals)) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("jumlah baris yang dibulatkan sama dengan subtotal", () => {
    const line = item({ quantity: 1.5, unitPrice: 999 });
    const totals = computeTotals({
      items: [line, line],
      discount: 0,
      shippingCost: 0,
      taxEnabled: false,
      taxRate: 0,
      downPayment: 0,
    });
    expect(lineTotal(line) * 2).toBe(totals.subtotal);
  });
});
