import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Correo inválido"),
    fullName: z.string().min(2, "Nombre muy corto"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    passwordConfirm: z.string(),
    phone: z
      .string()
      .trim()
      .min(10, "Celular inválido")
      .max(20),
    accountType: z.enum(["player", "owner"], {
      message: "Elige jugador o dueño",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
