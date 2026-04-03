import { z } from "zod";

/** Valores alineados con enum `booking_status` en Postgres. */
export const bookingStatusSchema = z.enum(["PENDING", "PAID", "CANCELLED"]);

/** ISO 8601 / timestamptz aceptado por PostgREST. */
export const timestamptzStringSchema = z.string().min(1);

/**
 * Payload típico para crear reserva (validar en Server Action antes de insert).
 * Anti-solapamiento: además validar en servidor contra DB / exclusión GiST.
 */
export const createBookingInputSchema = z
  .object({
    fieldId: z.string().uuid(),
    startTime: timestamptzStringSchema,
    endTime: timestamptzStringSchema,
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    { message: "end_time debe ser posterior a start_time", path: ["endTime"] },
  );

export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;
