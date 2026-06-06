import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  if (!user) {
    redirect("/login");
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .maybeSingle();

  if (!role) {
    redirect("/dashboard");
  }

  const { data: tenants, error } = await supabaseAdmin
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const typedTenants = (tenants ?? []) as TenantRow[];

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Administración</h1>
      </div>

      <div className="mt-8 space-y-3">
        <CreateTenantForm />

        {typedTenants.map((tenant) => (
          <TenantAdminCard key={tenant.id} tenant={tenant} />
        ))}
      </div>
    </main>
  );
}
