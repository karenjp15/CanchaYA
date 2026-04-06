import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  PAID: { label: "Confirmada", variant: "default" },
  CANCELLED: { label: "Cancelada", variant: "destructive" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const c = CONFIG[status];
  return (
    <Badge variant={c.variant} className={cn("text-[10px]")}>
      {c.label}
    </Badge>
  );
}
