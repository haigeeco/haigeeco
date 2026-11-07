// Validasi input Edge Function admin-users — modul murni tanpa dependensi,
// supaya bisa diuji offline (`deno test supabase/functions`).

export const VALID_ROLES = ["superuser", "staff_finance", "editor"] as const;

export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeUsername(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidRole(value: unknown): boolean {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value);
}

export function isValidUsername(value: unknown): boolean {
  const username = normalizeUsername(value);
  return username.length >= 3 && username.length <= 30 && /^[a-z0-9._-]+$/.test(username);
}

// Username otomatis dari bagian lokal email, dipakai bila admin mengosongkan field.
export function deriveUsername(email: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);
  return base.length >= 3 ? base : `user-${Math.random().toString(36).slice(2, 6)}`;
}

// Mengembalikan pesan error, atau null bila valid.
export function validateCreate(input: {
  email?: unknown;
  password?: unknown;
  role?: unknown;
  username?: unknown;
}): string | null {
  if (!normalizeEmail(input.email)) return "Email wajib diisi.";
  if (typeof input.password !== "string" || input.password.length < 6) {
    return "Kata sandi minimal 6 karakter.";
  }
  if (!isValidRole(input.role)) return "Peran tidak valid.";

  const username = normalizeUsername(input.username);
  if (username && !isValidUsername(username)) {
    return "Username harus 3-30 karakter dan hanya boleh huruf kecil, angka, titik, garis bawah, atau strip.";
  }
  return null;
}
