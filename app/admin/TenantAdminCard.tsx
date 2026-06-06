"use client";

import { useMemo, useState } from "react";
import { deleteTenant, updateTenant } from "./actions";
import TenantOwnerForm from "./TenantOwnerForm";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
};

function createSlugPreview(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TenantAdminCard({ tenant }: { tenant: TenantRow }) {
  const [name, setName] = useState(tenant.name);

  const nextSlug = useMemo(() => createSlugPreview(name), [name]);
  const slugWillChange = nextSlug !== tenant.slug;

  return (
    <div className="rounded-xl border p-4">
      <form action={updateTenant} className="space-y-3">
        <input type="hidden" name="id" value={tenant.id} />
        <input type="hidden" name="currentSlug" value={tenant.slug} />

        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border px-3 py-2 font-semibold"
        />

        <div className="text-sm text-gray-500">
          <p>
            Link actual: <span className="font-mono">/c/{tenant.slug}</span>
          </p>

          <p>
            Nuevo link: <span className="font-mono">/c/{nextSlug || tenant.slug}</span>
          </p>
        </div>

        {slugWillChange && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
            <p className="font-medium">Advertencia</p>
            <p className="mt-1">
              Cambiar el nombre modificará el link público. El QR anterior dejará de funcionar y la notaría deberá
              imprimir un nuevo código QR.
            </p>
            <label className="mt-3 flex items-start gap-2">
              <input type="checkbox" name="confirmSlugChange" className="mt-1" required />
              <span>Entiendo que el link público cambiará y que será necesario generar/imprimir un nuevo QR.</span>
            </label>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={tenant.active} />
          Activa
        </label>

        <button className="rounded-md border px-3 py-2 text-sm">Guardar</button>
      </form>

      <form action={deleteTenant} className="mt-3">
        <input type="hidden" name="id" value={tenant.id} />
        <button className="rounded-md border px-3 py-2 text-sm text-red-600">Eliminar</button>
      </form>
      <TenantOwnerForm tenantId={tenant.id} />
    </div>
  );
}
