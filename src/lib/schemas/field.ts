import { z } from "zod";

/** Franjas especiales enviadas como JSON desde el formulario de cancha. */
export const specialBandSchema = z
  .object({
    id: z.string(),
    preset: z.enum(["all", "weekdays", "weekend", "custom"]),
    customDays: z.array(z.number().int().min(0).max(6)),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    price: z.coerce.number().min(0),
  })
  .superRefine((data, ctx) => {
    const [sh, sm] = data.start.split(":").map(Number);
    const [eh, em] = data.end.split(":").map(Number);
    const sMin = sh * 60 + sm;
    const eMin = eh * 60 + em;
    if (eMin <= sMin) {
      ctx.addIssue({
        code: "custom",
        message: "La hora fin debe ser mayor al inicio",
        path: ["end"],
      });
    }
    if (data.preset === "custom" && data.customDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Elige al menos un día",
        path: ["customDays"],
      });
    }
  });

export const pricingWindowsPayloadSchema = z.array(specialBandSchema);

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
