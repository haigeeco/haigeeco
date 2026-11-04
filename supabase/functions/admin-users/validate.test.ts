// Jalankan: deno test supabase/functions
// Asertif tanpa impor apa pun supaya bisa jalan offline dan cepat.
import { isValidRole, normalizeEmail, validateCreate } from "./validate.ts";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
  console.log(`ok - ${message}`);
}

Deno.test("normalizeEmail memangkas spasi dan menurunkan huruf", () => {
  assert(normalizeEmail("  Rina@GeeCo.ID ") === "rina@geeco.id", "email dinormalisasi");
  assert(normalizeEmail(undefined) === "", "email kosong aman");
});

Deno.test("isValidRole hanya menerima peran yang dikenal", () => {
  assert(isValidRole("superuser"), "superuser valid");
  assert(isValidRole("editor"), "editor valid");
  assert(isValidRole("staff_finance"), "staff_finance valid");
  assert(!isValidRole("admin"), "peran tak dikenal ditolak");
  assert(!isValidRole(""), "string kosong ditolak");
  assert(!isValidRole(null), "null ditolak");
});

Deno.test("validateCreate menolak input tidak valid", () => {
  assert(validateCreate({ email: "", password: "123456", role: "editor" }) !== null, "email kosong ditolak");
  assert(validateCreate({ email: "a@b.com", password: "12345", role: "editor" }) !== null, "sandi <6 ditolak");
  assert(validateCreate({ email: "a@b.com", password: "123456", role: "admin" }) !== null, "peran salah ditolak");
});

Deno.test("validateCreate menerima input yang valid", () => {
  assert(validateCreate({ email: "a@b.com", password: "123456", role: "editor" }) === null, "input valid");
  assert(validateCreate({ email: "A@B.com", password: "sandi-uji-aman", role: "superuser" }) === null, "peran superuser valid");
});
