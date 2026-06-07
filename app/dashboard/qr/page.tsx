import { redirect } from "next/navigation";

import { PageHeader } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import QrGenerator from "./QrGenerator";

type TenantRow = {
  id: string;
  slug: string;
  name: string;
};

export default async function QrPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase.from("user_roles").select("role, tenant_id").eq("user_id", user.id);

  const tenantRole = (roles ?? []).find((r) => r.role === "tenant_owner");

  if (!tenantRole?.tenant_id) {
    redirect("/dashboard/requests");
  }

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id,name,slug")
    .eq("id", tenantRole.tenant_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Portal cliente"
        title="Código QR"
        description={`Imprime este código para que los clientes puedan solicitar documentos de ${tenant.name}.`}
      />

      <QrGenerator tenant={tenant as TenantRow} />
    </div>
  );
}
