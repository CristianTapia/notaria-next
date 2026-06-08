import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, PageHeader } from "@/components/ui";
import CreateTenantForm from "./CreateTenantForm";
import TenantAdminCard from "./TenantAdminCard";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .maybeSingle();

  if (!role) redirect("/dashboard");

  const { data: tenants, error } = await supabaseAdmin
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const typedTenants = (tenants ?? []) as TenantRow[];
  const activeCount = typedTenants.filter((tenant) => tenant.active).length;

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Administración global"
        title="Notarías"
        description="Crea, administra y asigna dueños a cada notaría."
      >
        <Card className="hidden px-5 py-3 text-right md:block">
          <p className="text-2xl font-medium">{typedTenants.length}</p>
          <p className="text-xs text-[var(--color-muted)]">{activeCount} activas</p>
        </Card>
      </PageHeader>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <CreateTenantForm />
        </div>

        <section className="min-w-0 space-y-3">
          {typedTenants.length === 0 ? (
            <Card className="p-6 text-center sm:p-8">
              <p className="text-sm text-[var(--color-muted)]">Aún no hay notarías creadas.</p>
            </Card>
          ) : (
            typedTenants.map((tenant) => <TenantAdminCard key={tenant.id} tenant={tenant} />)
          )}
        </section>
      </div>
    </div>
  );
}
