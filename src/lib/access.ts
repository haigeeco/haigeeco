import type { AppRole } from "./types";

export const SUPERUSER_ONLY: AppRole[] = ["superuser"];
export const FINANCE_ROLES: AppRole[] = ["superuser", "staff_finance"];
export const CONTENT_ROLES: AppRole[] = ["superuser", "editor"];

const ROLE_HOME: Record<AppRole, string> = {
  superuser: "/admin",
  staff_finance: "/admin/invoices",
  editor: "/admin/blog",
};

export function homePathForRole(role: AppRole | null | undefined): string {
  return role ? ROLE_HOME[role] : "/admin";
}
