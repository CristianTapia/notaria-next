"use client";

import { UserPlus } from "lucide-react";

import { Button, FormField, Input, Select } from "@/components/ui";
import { assignTenantOwner } from "./actions";

type TenantOption = {
  id: string;
  name: string;
};

export default function TenantOwnerForm({ tenants }: { tenants: TenantOption[] }) {
  return (
    <form action={assignTenantOwner}>
      <div className="space-y-3">
        <FormField label="Notaría" description="Seleccione la notaría que tendrá este propietario." required>
          <Select name="tenantId" required>
            <option value="">Seleccione una notaría</option>

            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Correo" description="Se enviará una invitación al/la notario/a." required>
          <Input name="email" type="email" placeholder="correo@ejemplo.com" />
        </FormField>
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
