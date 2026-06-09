import { z } from "zod";

export const createTenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres"),
});

export const updateTenantSchema = z.object({
  id: z.string().uuid("Tenant inválido"),
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres"),
  currentSlug: z.string().min(1, "Slug actual requerido"),
  active: z.boolean(),
  confirmSlugChange: z.boolean(),
});
