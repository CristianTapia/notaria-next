import { z } from "zod";

export const inviteUserSchema = z.object({
  tenantId: z.string().uuid("Tenant inválido"),
  email: z.string().trim().toLowerCase().email("Correo inválido").max(120, "El correo es demasiado largo"),
});
