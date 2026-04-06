import { z } from "zod";

const fieldCore = {
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  fieldType: z.enum(["F5", "F6", "F7", "F8", "F11"]),
  surface: z.enum(["ROOFED", "OPEN"]),
  hourlyPrice: z.coerce.number().min(0, "El precio debe ser positivo"),
};

export const fieldCreateSchema = z.object({
  ...fieldCore,
  venueId: z.string().uuid("Elige un establecimiento"),
});

export const fieldUpdateSchema = z.object({
  ...fieldCore,
});

export type FieldCreateInput = z.infer<typeof fieldCreateSchema>;
export type FieldUpdateInput = z.infer<typeof fieldUpdateSchema>;
