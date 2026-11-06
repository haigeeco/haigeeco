// Helper murni untuk Edge Function `rebuild-site` (diuji di validate.test.ts).

const TRIGGER_ROLES = ["superuser", "editor"];

export function canTriggerRebuild(role: unknown): boolean {
  return typeof role === "string" && TRIGGER_ROLES.includes(role);
}

export function normalizeHookUrl(value: unknown): string {
  const url = String(value ?? "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}
