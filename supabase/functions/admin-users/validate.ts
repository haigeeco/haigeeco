// Validasi input Edge Function admin-users — modul murni tanpa dependensi,
// supaya bisa diuji offline (`deno test supabase/functions`).

export const VALID_ROLES = ["superuser", "staff_finance", "editor"] as const;

export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidRole(value: unknown): boolean {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value);
}

// Mengembalikan pesan error, atau null bila valid.
export function validateCreate(input: {
  email?: unknown;
  password?: unknown;
  role?: unknown;
}): string | null {
  if (!normalizeEmail(input.email)) return "Email wajib diisi.";
  if (typeof input.password !== "string" || input.password.length < 6) {
    return "Kata sandi minimal 6 karakter.";
  }
  if (!isValidRole(input.role)) return "Peran tidak valid.";
  return null;
}
