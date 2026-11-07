// Jalankan: deno test supabase/functions
// Asertif tanpa impor apa pun supaya bisa jalan offline dan cepat.
import {
  deriveUsername,
  isValidRole,
  isValidUsername,
  normalizeEmail,
  normalizeUsername,
  validateCreate,
} from "./validate.ts";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
  console.log(`ok - ${message}`);
}

Deno.test("normalizeEmail memangkas spasi dan menurunkan huruf", () => {
  assert(normalizeEmail("  Rina@GeeCo.ID ") === "rina@geeco.id", "email dinormalisasi");
  assert(normalizeEmail(undefined) === "", "email kosong aman");
});

Deno.test("normalizeUsername memangkas spasi dan menurunkan huruf", () => {
  assert(normalizeUsername("  Rina ") === "rina", "username dinormalisasi");
  assert(normalizeUsername(undefined) === "", "username kosong aman");
});

Deno.test("isValidRole hanya menerima peran yang dikenal", () => {
  assert(isValidRole("superuser"), "superuser valid");
  assert(isValidRole("editor"), "editor valid");
  assert(isValidRole("staff_finance"), "staff_finance valid");
  assert(!isValidRole("admin"), "peran tak dikenal ditolak");
  assert(!isValidRole(""), "string kosong ditolak");
  assert(!isValidRole(null), "null ditolak");
});

Deno.test("isValidUsername memvalidasi format username", () => {
  assert(isValidUsername("rina"), "username valid");
  assert(isValidUsername("rina.kartika_01"), "titik dan garis bawah valid");
  assert(!isValidUsername("ri"), "terlalu pendek ditolak");
  assert(!isValidUsername("rina kartika"), "spasi ditolak");
  assert(!isValidUsername("Rina"), "huruf besar dinormalisasi dulu, tetap valid");
  assert(!isValidUsername("@rina"), "karakter tidak valid ditolak");
  assert(!isValidUsername(""), "kosong ditolak");
});

Deno.test("deriveUsername membuat username dari email", () => {
  assert(deriveUsername("Rina@GeeCo.ID") === "rina", "dari email biasa");
  assert(deriveUsername("a@b.com").length >= 3, "email pendek tetap menghasilkan username");
});

Deno.test("validateCreate menolak input tidak valid", () => {
  assert(validateCreate({ email: "", password: "123456", role: "editor" }) !== null, "email kosong ditolak");
  assert(validateCreate({ email: "a@b.com", password: "12345", role: "editor" }) !== null, "sandi <6 ditolak");
  assert(validateCreate({ email: "a@b.com", password: "123456", role: "admin" }) !== null, "peran salah ditolak");
  assert(
    validateCreate({ email: "a@b.com", password: "123456", role: "editor", username: "ri" }) !== null,
    "username terlalu pendek ditolak"
  );
  assert(
    validateCreate({ email: "a@b.com", password: "123456", role: "editor", username: "rina kartika" }) !== null,
    "username dengan spasi ditolak"
  );
});

Deno.test("validateCreate menerima input yang valid", () => {
  assert(validateCreate({ email: "a@b.com", password: "123456", role: "editor" }) === null, "input valid tanpa username");
  assert(
    validateCreate({ email: "a@b.com", password: "123456", role: "editor", username: "rina" }) === null,
    "input valid dengan username"
  );
  assert(
    validateCreate({ email: "A@B.com", password: "sandi-uji-aman", role: "superuser" }) === null,
    "peran superuser valid"
  );
});
