import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

type RoleRow = {
  role: string;
  tenant_id: string | null;
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase.from("user_roles").select("role, tenant_id").eq("user_id", user.id);

  const typedRoles = (roles ?? []) as RoleRow[];

  const isTenantOwner = typedRoles.some((r) => r.role === "tenant_owner");
  const isTenantMember = typedRoles.some((r) => r.role === "tenant_member");
  const isSuperAdmin = typedRoles.some((r) => r.role === "super_admin");

  if (isSuperAdmin) {
    redirect("/admin");
  }

  if (!isTenantOwner && !isTenantMember) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4">
        <h1 className="text-xl font-bold">Notaría</h1>

        <nav className="mt-8 space-y-2">
          <Link className="block rounded-md px-3 py-2 hover:bg-gray-100" href="/dashboard/requests">
            Solicitudes
          </Link>

          {isTenantOwner && (
            <>
              <Link className="block rounded-md px-3 py-2 hover:bg-gray-100" href="/dashboard/documents">
                Documentos
              </Link>

              <Link className="block rounded-md px-3 py-2 hover:bg-gray-100" href="/dashboard/qr">
                QR
              </Link>

              <Link className="block rounded-md px-3 py-2 hover:bg-gray-100" href="/dashboard/users">
                Usuarios
              </Link>
            </>
          )}
        </nav>

        <div className="mt-8 border-t pt-4 text-sm text-gray-500">{user.email}</div>
        <LogoutButton />
      </aside>

      <section className="flex-1">{children}</section>
    </div>
  );
}
