import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  /** Tamaño del contenedor (isotipo escalado con object-contain). */
  size?: "sm" | "md";
  className?: string;
} & ComponentPropsWithoutRef<"span">;

const dim = { sm: 32, md: 40 } as const;

/**
 * Logo CanchaYa: el PNG puede traer fondo blanco; en tema claro `mix-blend-multiply`
 * funde ese blanco con el fondo del navbar (mismo tono que `bg-background`).
 * En oscuro el contraste del PNG suele verse bien sobre `bg-card` / rail.
 */
export function BrandMark({
  size = "sm",
  className,
  ...spanProps
}: BrandMarkProps) {
  const px = dim[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
        size === "sm" ? "size-8" : "size-10",
        /* Mismo tono base que el navbar / rail para que el blanco del asset no “flote”. */
        "bg-background dark:bg-card",
        className,
      )}
      {...spanProps}
    >
      <Image
        src="/brand/cancha-ya-logo.png"
        alt=""
        width={px}
        height={px}
        sizes={`${px}px`}
        className={cn(
          "size-full object-contain p-0.5",
          "mix-blend-multiply dark:mix-blend-normal",
        )}
        priority
      />
    </span>
  );
}
