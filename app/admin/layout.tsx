import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/app/dashboard/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4">
        <h1 className="text-xl font-bold">Lab3c Admin</h1>

        <nav className="mt-8 space-y-2">
          <Link href="/admin" className="block rounded-md px-3 py-2 hover:bg-gray-100">
            Notarías
          </Link>
        </nav>

        <div className="mt-8 border-t pt-4 text-sm text-gray-500">
          <p>{user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      <section className="flex-1">{children}</section>
    </div>
  );
}
