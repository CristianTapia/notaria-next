import { z } from "zod";

export const fieldSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "La pregunta debe tener al menos 2 caracteres")
    .max(150, "La pregunta no puede superar los 150 caracteres"),
  fieldType: z.enum(["text", "textarea", "email", "phone", "number", "date", "select"]),
  required: z.boolean(),
  placeholder: z.string().trim().max(120, "El placeholder no puede superar los 120 caracteres").optional(),
  optionsText: z.string().trim().max(500, "Las opciones no pueden superar los 500 caracteres").optional(),
});
