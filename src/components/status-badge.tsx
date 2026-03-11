import type { ProfileStatus, DocStatus, BillingStatus } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-ink-muted/15 text-ink-muted",
  Reviewing: "bg-yellow-500/15 text-yellow-600",
  Ready_for_Partner: "bg-accent/15 text-accent-bold",
  Submitted_to_Partner: "bg-purple-500/15 text-purple-600",
  Invoiced: "bg-orange-500/15 text-orange-600",
  Paid: "bg-green-500/15 text-green-600",
  Hired: "bg-emerald-500/15 text-emerald-600",
  // Doc statuses
  Missing: "bg-ink-muted/15 text-ink-muted",
  Uploaded: "bg-accent/15 text-accent-bold",
  Needs_Correction: "bg-red-500/15 text-red-500",
  Verified: "bg-green-500/15 text-green-600",
  // Billing statuses
  Unpaid: "bg-red-500/15 text-red-500",
  Cancelled: "bg-ink-muted/15 text-ink-muted",
};

export function StatusBadge({ status }: { status: ProfileStatus | DocStatus | BillingStatus | string }) {
  const style = STATUS_STYLES[status] ?? "bg-dim text-ink-secondary";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
