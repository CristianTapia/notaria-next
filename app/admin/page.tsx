import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Card, PageHeader } from "@/components/ui";
import CreateTenantForm from "./CreateTenantForm";
import TenantAdminCard from "./TenantAdminCard";
import TenantOwnerForm from "./TenantOwnerForm";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
};

type UserRoleRow = {
  id: string;
  user_id: string;
  role: string;
  tenant_id: string;
};

type TenantTeamMember = {
  id: string;
  userId: string;
  email: string;
  role: string;
};

type TenantTeamMap = Record<string, TenantTeamMember[]>;

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

  const tenantIds = typedTenants.map((tenant) => tenant.id);

  const { data: tenantRoles, error: tenantRolesError } = await supabaseAdmin
    .from("user_roles")
    .select("id,user_id,role,tenant_id")
    .in("tenant_id", tenantIds);

  if (tenantRolesError) {
    throw new Error(tenantRolesError.message);
  }

  const typedTenantRoles = (tenantRoles ?? []) as UserRoleRow[];

  const { data: usersRes, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const users = usersRes.users;

  const tenantTeams = typedTenantRoles.reduce<TenantTeamMap>((acc, role) => {
    const user = users.find((item) => item.id === role.user_id);

    if (!acc[role.tenant_id]) {
      acc[role.tenant_id] = [];
    }

    acc[role.tenant_id].push({
      id: role.id,
      userId: role.user_id,
      email: user?.email ?? role.user_id,
      role: role.role,
    });

    return acc;
  }, {});

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

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <section className="min-w-0 space-y-4">
          <CreateTenantForm />

          {typedTenants.length === 0 ? (
            <Card className="p-6 text-center sm:p-8">
              <p className="text-sm text-[var(--color-muted)]">Aún no hay notarías creadas.</p>
            </Card>
          ) : (
            typedTenants.map((tenant) => (
              <TenantAdminCard key={tenant.id} tenant={tenant} team={tenantTeams[tenant.id] ?? []} />
            ))
          )}
        </section>

        <aside className="min-w-0 space-y-4">
          <Card>
            <TenantOwnerForm
              tenants={typedTenants.map((tenant) => ({
                id: tenant.id,
                name: tenant.name,
              }))}
            />
          </Card>

          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Resumen</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[var(--color-cream-input)] p-4">
                <p className="text-2xl font-medium">{typedTenants.length}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">notarías</p>
              </div>

              <div className="rounded-2xl bg-[var(--color-cream-input)] p-4">
                <p className="text-2xl font-medium">{activeCount}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">activas</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
