import { z } from "zod";

export const checkoutSchema = z.object({
  fieldId: z.string().uuid(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  address: z.string().min(3, "Dirección requerida"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(10, "Celular inválido").max(20),
  idDocumentType: z.enum(["CC", "CE", "NIT"]),
  idNumber: z.string().min(4, "Número de identificación requerido"),
  paymentMethod: z.enum(["PSE", "MASTERCARD", "VISA"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
