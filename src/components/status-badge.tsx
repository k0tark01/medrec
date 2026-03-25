import type { ProfileStatus, DocStatus, BillingStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-transparent",
  Reviewing: "bg-yellow-500/15 text-yellow-600 border-transparent",
  Ready_for_Partner: "bg-primary/15 text-primary border-transparent",
  Submitted_to_Partner: "bg-purple-500/15 text-purple-600 border-transparent",
  Approved: "bg-emerald-500/15 text-emerald-600 border-transparent",
  Rejected: "bg-red-500/15 text-red-500 border-transparent",
  Invoiced: "bg-orange-500/15 text-orange-600 border-transparent",
  Paid: "bg-green-500/15 text-green-600 border-transparent",
  Hired: "bg-emerald-500/15 text-emerald-600 border-transparent",
  // Doc statuses
  Missing: "bg-muted text-muted-foreground border-transparent",
  Uploaded: "bg-primary/15 text-primary border-transparent",
  Needs_Correction: "bg-red-500/15 text-red-500 border-transparent",
  Verified: "bg-green-500/15 text-green-600 border-transparent",
  // Billing statuses
  Unpaid: "bg-red-500/15 text-red-500 border-transparent",
  Cancelled: "bg-muted text-muted-foreground border-transparent",
};

export function StatusBadge({ status }: { status: ProfileStatus | DocStatus | BillingStatus | string }) {
  const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-transparent";
  return (
    <Badge variant="outline" className={style}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
