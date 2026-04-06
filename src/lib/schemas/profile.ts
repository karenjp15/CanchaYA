import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Nombre muy corto"),
  phone: z.string().trim().min(10, "Celular inválido").max(20),
  address: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
