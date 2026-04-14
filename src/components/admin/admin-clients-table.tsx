"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AdminClient, AdminClientSegment } from "@/lib/data/admin";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

const SEGMENT_LABEL: Record<AdminClientSegment, string> = {
  CHAMPION: "Campeón",
  EN_RIESGO: "En riesgo",
  POTENCIAL: "Potencial",
  REGULAR: "Regular",
};

function SegmentBadge({ segmento }: { segmento: AdminClientSegment }) {
  switch (segmento) {
    case "CHAMPION":
      return (
        <Badge
          className="border-emerald-600/30 bg-emerald-600/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
          variant="outline"
        >
          {SEGMENT_LABEL[segmento]}
        </Badge>
      );
    case "EN_RIESGO":
      return <Badge variant="destructive">{SEGMENT_LABEL[segmento]}</Badge>;
    case "POTENCIAL":
      return (
        <Badge className="border-blue-600/30 bg-blue-600 text-white hover:bg-blue-600/90">
          {SEGMENT_LABEL[segmento]}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-[10px]">
          {SEGMENT_LABEL[segmento]}
        </Badge>
      );
  }
}

function whatsappDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("57")) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
}

function whatsappHref(client: AdminClient): string | null {
  const n = whatsappDigits(client.phone);
  if (!n) return null;
  const text = `Hola ${client.name}, te saludamos desde ${client.contact_venue_name}. ¡Gracias por jugar con nosotros! Si quieres reservar de nuevo, estamos para ayudarte.`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

function ClientActions({ client }: { client: AdminClient }) {
  const href = whatsappHref(client);

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:justify-start">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          aria-label={`Contactar a ${client.name} por WhatsApp`}
        >
          <MessageCircle className="size-3.5" />
        </a>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled
          aria-label="Sin número de WhatsApp"
        >
          <MessageCircle className="size-3.5 opacity-50" />
        </Button>
      )}

      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex w-fit cursor-default" />}
        >
          <Button type="button" variant="outline" size="sm" disabled>
            Reactivar
          </Button>
        </TooltipTrigger>
        <TooltipContent>Función en desarrollo</TooltipContent>
      </Tooltip>
    </div>
  );
}

type Props = {
  clients: AdminClient[];
};

export function AdminClientsTable({ clients }: Props) {
  return (
    <TooltipProvider delay={200}>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Teléfono</th>
              <th className="px-4 py-2.5 font-medium text-center">Reservas</th>
              <th className="px-4 py-2.5 font-medium text-right">
                Total gastado
              </th>
              <th className="px-4 py-2.5 font-medium text-center">Estado</th>
              <th className="px-4 py-2.5 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className="text-[10px]">
                    {c.reservas}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium text-primary">
                  {formatCOP(c.totalGastado)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <SegmentBadge segmento={c.segmento} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <ClientActions client={c} />
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Aún no hay clientes con reservas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
