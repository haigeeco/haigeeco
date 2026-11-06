import { describe, expect, it } from "vitest";
import { formatDate, formatIDR, parseNumber, slugify } from "./format";

describe("parseNumber", () => {
  it("mem-parsing angka polos dari input number", () => {
    expect(parseNumber("1850000")).toBe(1_850_000);
    expect(parseNumber("1234567.5")).toBe(1_234_567.5);
  });

  it("mengembalikan 0 untuk nilai tidak valid", () => {
    expect(parseNumber("bukan angka")).toBe(0);
    expect(parseNumber("")).toBe(0);
  });
});

describe("formatIDR", () => {
  it("memformat rupiah tanpa desimal", () => {
    expect(formatIDR(1_850_000)).toContain("1.850.000");
  });

  it("membulatkan nilai pecahan", () => {
    expect(formatIDR(1000.6)).toContain("1.001");
  });
});

describe("slugify", () => {
  it("membuat slug dari judul", () => {
    expect(slugify("5 Tips Memilih Dessert!")).toBe("5-tips-memilih-dessert");
  });

  it("menghapus aksen", () => {
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
  });

  it("merapikan spasi dan tanda hubung berlebih", () => {
    expect(slugify("  Halo   Dunia --  ")).toBe("halo-dunia");
  });
});

describe("formatDate", () => {
  it("menangani tanggal saja (YYYY-MM-DD)", () => {
    expect(formatDate("2026-11-03")).toContain("2026");
  });

  it("menangani timestamp penuh, bukan menampilkan string mentah", () => {
    const iso = "2026-11-03T09:30:00.000Z";
    const formatted = formatDate(iso);
    expect(formatted).not.toBe(iso);
    expect(formatted).toContain("2026");
  });
});
