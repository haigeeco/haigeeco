// Jalankan: deno test supabase/functions
// Asertif tanpa impor apa pun supaya bisa jalan offline dan cepat.
import { canTriggerRebuild, normalizeHookUrl } from "./validate.ts";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
  console.log(`ok - ${message}`);
}

Deno.test("canTriggerRebuild hanya untuk superuser dan editor", () => {
  assert(canTriggerRebuild("superuser"), "superuser boleh");
  assert(canTriggerRebuild("editor"), "editor boleh");
  assert(!canTriggerRebuild("staff_finance"), "staff_finance ditolak");
  assert(!canTriggerRebuild(null), "role null ditolak");
  assert(!canTriggerRebuild("admin"), "peran tak dikenal ditolak");
});

Deno.test("normalizeHookUrl hanya menerima https yang valid", () => {
  assert(
    normalizeHookUrl("https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/abc") ===
      "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/abc",
    "https valid diterima"
  );
  assert(normalizeHookUrl("  https://contoh.com/hook  ") === "https://contoh.com/hook", "spasi dipangkas");
  assert(normalizeHookUrl("http://contoh.com/hook") === "", "http ditolak");
  assert(normalizeHookUrl("javascript:alert(1)") === "", "skema lain ditolak");
  assert(normalizeHookUrl("bukan-url") === "", "url rusak ditolak");
  assert(normalizeHookUrl(undefined) === "", "kosong aman");
});
