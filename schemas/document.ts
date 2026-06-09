import { z } from "zod";

export const documentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(120, "El título no puede superar los 120 caracteres"),
  description: z.string().trim().max(500, "La descripción no puede superar los 500 caracteres").optional(),
});
