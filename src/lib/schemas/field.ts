import { z } from "zod";

export const fieldFormSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  fieldType: z.enum(["F5", "F6", "F7", "F8", "F11"]),
  surface: z.enum(["ROOFED", "OPEN"]),
  hourlyPrice: z.coerce.number().min(0, "El precio debe ser positivo"),
  address: z.string().min(3, "Dirección requerida"),
  parkingAvailable: z.coerce.boolean(),
  sellsLiquor: z.coerce.boolean(),
});

export type FieldFormInput = z.infer<typeof fieldFormSchema>;
