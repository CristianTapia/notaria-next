import { FileText, QrCode, Users, ClipboardList, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";

import LogoutButton from "./LogoutButton";
import AppShell from "@/components/layouts/AppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    redirect("/login");
  }

  const ownerOnlyNavItems = [
    {
      href: "/dashboard/documents",
      label: "Documentos",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      href: "/dashboard/qr",
      label: "QR",
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      href: "/dashboard/users",
      label: "Usuarios",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  const navItems = [
    ...(isTenantOwner
      ? [
          {
            href: "/dashboard",
            label: "Resumen",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
        ]
      : []),

    {
      href: "/dashboard/requests",
      label: "Solicitudes",
      icon: <ClipboardList className="h-4 w-4" />,
    },

    ...(isTenantOwner ? ownerOnlyNavItems : []),
  ];

  return (
    <AppShell
      title="Notaría"
      subtitle={isTenantOwner ? "Panel administrador" : "Panel funcionario"}
      email={user.email}
      navItems={navItems}
      footer={<LogoutButton />}
    >
      {children}
    </AppShell>
  );
}
