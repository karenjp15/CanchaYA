import { z } from "zod";

const core = {
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  hourlyPrice: z.coerce.number().min(0, "El precio debe ser positivo"),
  sport: z.enum(["PADEL", "FUTBOL"]),
  slotDurationMinutes: z.coerce
    .number()
    .refine((n) => [60, 90, 120].includes(n), "Duración de slot inválida"),
};

export const fieldCreateSchema = z
  .object({
    ...core,
    venueId: z.string().uuid("Elige un establecimiento"),
    footballCapacity: z.enum(["F5", "F7", "F9", "F11"]).optional(),
    footballSurface: z.enum(["SYNTHETIC_GRASS", "NATURAL_GRASS"]).optional(),
    padelWall: z.enum(["GLASS", "WALL"]).optional(),
    padelLocation: z.enum(["INDOOR", "OUTDOOR"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sport === "FUTBOL") {
      if (!data.footballCapacity) {
        ctx.addIssue({
          code: "custom",
          message: "Elige capacidad de cancha",
          path: ["footballCapacity"],
        });
      }
      if (!data.footballSurface) {
        ctx.addIssue({
          code: "custom",
          message: "Elige tipo de grama",
          path: ["footballSurface"],
        });
      }
      if (data.slotDurationMinutes !== 60) {
        ctx.addIssue({
          code: "custom",
          message: "Fútbol usa reservas de 60 minutos",
          path: ["slotDurationMinutes"],
        });
      }
    }
    if (data.sport === "PADEL") {
      if (!data.padelWall) {
        ctx.addIssue({
          code: "custom",
          message: "Elige material de cerramiento",
          path: ["padelWall"],
        });
      }
      if (!data.padelLocation) {
        ctx.addIssue({
          code: "custom",
          message: "Elige ubicación de la pista",
          path: ["padelLocation"],
        });
      }
      if (![60, 90].includes(data.slotDurationMinutes)) {
        ctx.addIssue({
          code: "custom",
          message: "Pádel: duración 60 u 90 minutos",
          path: ["slotDurationMinutes"],
        });
      }
    }
  });

export const fieldUpdateSchema = z
  .object({
    ...core,
    footballCapacity: z.enum(["F5", "F7", "F9", "F11"]).optional(),
    footballSurface: z.enum(["SYNTHETIC_GRASS", "NATURAL_GRASS"]).optional(),
    padelWall: z.enum(["GLASS", "WALL"]).optional(),
    padelLocation: z.enum(["INDOOR", "OUTDOOR"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sport === "FUTBOL") {
      if (!data.footballCapacity) {
        ctx.addIssue({
          code: "custom",
          message: "Elige capacidad de cancha",
          path: ["footballCapacity"],
        });
      }
      if (!data.footballSurface) {
        ctx.addIssue({
          code: "custom",
          message: "Elige tipo de grama",
          path: ["footballSurface"],
        });
      }
      if (data.slotDurationMinutes !== 60) {
        ctx.addIssue({
          code: "custom",
          message: "Fútbol usa reservas de 60 minutos",
          path: ["slotDurationMinutes"],
        });
      }
    }
    if (data.sport === "PADEL") {
      if (!data.padelWall) {
        ctx.addIssue({
          code: "custom",
          message: "Elige material de cerramiento",
          path: ["padelWall"],
        });
      }
      if (!data.padelLocation) {
        ctx.addIssue({
          code: "custom",
          message: "Elige ubicación de la pista",
          path: ["padelLocation"],
        });
      }
      if (![60, 90].includes(data.slotDurationMinutes)) {
        ctx.addIssue({
          code: "custom",
          message: "Pádel: duración 60 u 90 minutos",
          path: ["slotDurationMinutes"],
        });
      }
    }
  });
