import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Ingresa un correo válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
