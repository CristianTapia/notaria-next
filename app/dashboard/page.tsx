import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RoleRow = {
  id: string;
  role: string;
  tenant_id: string | null;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const authResult = await supabase.auth.getUser();

  console.log("SERVER USER", authResult.data.user?.email);
  console.log("SERVER AUTH ERROR", authResult.error?.message);

  const user = authResult.data.user;

  if (!user) {
    redirect("/login");
  }

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("id, role, tenant_id")
    .eq("user_id", user.id);

  console.log("SERVER ROLES", roles);

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  const typedRoles = (roles ?? []) as RoleRow[];

  const isSuperAdmin = typedRoles.some((r) => r.role === "super_admin");
  const tenantRole = typedRoles.find((r) => r.role === "tenant_owner" || r.role === "tenant_member");

  if (isSuperAdmin) {
    redirect("/admin");
  }

  if (!tenantRole) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">Cuenta sin notaría asignada</h1>
        <p className="mt-4 text-gray-500">Su cuenta existe, pero aún no tiene una notaría asignada.</p>
      </main>
    );
  }

  redirect("/dashboard/requests");
}
