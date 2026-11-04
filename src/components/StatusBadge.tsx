import type { Invoice } from "@/lib/types";
import { STATUS_LABEL, displayStatus, type DisplayStatus } from "@/lib/calc";
import { cn } from "./ui";

const STYLES: Record<DisplayStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-sky-100 text-sky-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-400 line-through",
};

export function StatusBadge({ invoice }: { invoice: Invoice }) {
  const status = displayStatus(invoice);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
