"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldFormDialog } from "@/components/admin/field-form-dialog";
import { FIELD_TYPE_LABELS } from "@/lib/constants";
import type { Field } from "@/lib/data/fields";
import { cn } from "@/lib/utils";
import { Power } from "lucide-react";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

type FieldsTableProps = {
  fields: Field[];
  onToggleActive?: (id: string, active: boolean) => void;
};

export function FieldsTable({ fields, onToggleActive }: FieldsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Nombre</th>
            <th className="px-4 py-2.5 font-medium">Dirección</th>
            <th className="px-4 py-2.5 font-medium">Tipo</th>
            <th className="px-4 py-2.5 font-medium">Superficie</th>
            <th className="px-4 py-2.5 font-medium text-right">Precio/h</th>
            <th className="px-4 py-2.5 font-medium text-center">Parking</th>
            <th className="px-4 py-2.5 font-medium text-center">Licor</th>
            <th className="px-4 py-2.5 font-medium text-center">Estado</th>
            <th className="px-4 py-2.5 font-medium text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr
              key={f.id}
              className={cn(
                "border-b border-border last:border-0 transition-colors hover:bg-muted/30",
                !f.is_active && "opacity-50",
              )}
            >
              <td className="px-4 py-3 font-medium">{f.name}</td>
              <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                {f.address}
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="text-[10px]">
                  {FIELD_TYPE_LABELS[f.field_type]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {f.surface === "ROOFED" ? "Techo" : "Abierta"}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatCOP(Number(f.hourly_price))}
              </td>
              <td className="px-4 py-3 text-center">
                {f.parking_available ? (
                  <span className="text-primary">✓</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {f.sells_liquor ? (
                  <span className="text-primary">✓</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge
                  variant={f.is_active ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {f.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <FieldFormDialog mode="edit" field={f} />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={f.is_active ? "Desactivar" : "Activar"}
                    onClick={() => onToggleActive?.(f.id, !f.is_active)}
                    className={cn(
                      f.is_active
                        ? "text-destructive hover:text-destructive"
                        : "text-primary hover:text-primary",
                    )}
                  >
                    <Power className="size-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {fields.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                No hay canchas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
