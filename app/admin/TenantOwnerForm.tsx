"use client";

import { UserPlus } from "lucide-react";

import { Button, Input, Select } from "@/components/ui";
import { assignTenantOwner } from "./actions";

type TenantOption = {
  id: string;
  name: string;
};

export default function TenantOwnerForm({ tenants }: { tenants: TenantOption[] }) {
  return (
    <form action={assignTenantOwner}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        Invitar dueño de notaría
      </p>

      <div className="space-y-3">
        <Select name="tenantId" required>
          <option value="">Seleccione una notaría</option>

          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </Select>

        <Input name="email" type="email" required placeholder="correo@ejemplo.com" />

        <Button type="submit" className="w-full">
          <UserPlus className="h-4 w-4" />
          Invitar owner
        </Button>
      </div>

      <p className="mt-3 break-words text-xs text-[var(--color-muted)]">
        Si el correo no existe, se enviará una invitación para crear su contraseña.
      </p>
    </form>
  );
}
