import { assignTenantOwner } from "./actions";

export default function TenantOwnerForm({ tenantId }: { tenantId: string }) {
  return (
    <form action={assignTenantOwner} className="mt-4 flex gap-2">
      <input type="hidden" name="tenantId" value={tenantId} />

      <input
        name="email"
        type="email"
        required
        placeholder="correo del notario"
        className="flex-1 rounded-md border px-3 py-2 text-sm"
      />

      <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Invitar owner</button>
    </form>
  );
}
