import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  BookingStatus,
  { label: string; cls: string }
> = {
  PENDING: { label: "Pendiente", cls: "bg-warning/15 text-warning border-warning/30" },
  PAID: { label: "Confirmada", cls: "bg-primary/15 text-primary border-primary/30" },
  CANCELLED: { label: "Cancelada", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const c = CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-[10px]", c.cls)}>
      {c.label}
    </Badge>
  );
}
