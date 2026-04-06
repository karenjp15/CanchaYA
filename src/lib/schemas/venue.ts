import { z } from "zod";

export const venueFormSchema = z.object({
  name: z.string().min(2, "Nombre del establecimiento requerido"),
  address: z.string().min(3, "Dirección requerida"),
  parkingAvailable: z.coerce.boolean(),
  sellsLiquor: z.coerce.boolean(),
});

export type VenueFormInput = z.infer<typeof venueFormSchema>;

export function parseOptionalCoord(
  raw: FormDataEntryValue | null,
): number | null {
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(String(raw));
  return Number.isFinite(n) ? n : null;
}
