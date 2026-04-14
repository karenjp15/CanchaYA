"use client";

import { useState, useTransition } from "react";
import { toggleFieldActive } from "@/actions/admin-fields";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import { cn } from "@/lib/utils";

export function FieldActiveToggle({
  fieldId,
  isActive: initial,
}: {
  fieldId: string;
  isActive: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={active ? "Desactivar cancha" : "Activar cancha"}
      disabled={pending}
      onClick={() => {
        const next = !active;
        setActive(next);
        startTransition(async () => {
          const res = await toggleFieldActive(fieldId, next);
          if (res.error) {
            setActive(!next);
          }
        });
      }}
      className={cn(
        active
          ? "text-destructive hover:text-destructive"
          : "text-primary hover:text-primary",
      )}
    >
      <Power className="size-3.5" />
    </Button>
  );
}
