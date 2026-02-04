import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "completed" | "pending" | "processing" | "failed";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    completed: "status-completed",
    pending: "status-pending",
    processing: "status-processing",
    failed: "status-failed",
  };

  const statusLabels = {
    completed: "Completed",
    pending: "Pending",
    processing: "Processing",
    failed: "Failed",
  };

  return (
    <span className={cn("status-badge uppercase", statusClasses[status])}>
      {statusLabels[status]}
    </span>
  );
}
