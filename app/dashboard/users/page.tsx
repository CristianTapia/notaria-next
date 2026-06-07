import { Mail, Trash2, UserRound, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge, Button, Card, Input, PageHeader } from "@/components/ui";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { inviteTenantMember, removeTenantMember } from "./actions";

type RoleRow = {
  id: string;
  user_id: string;
  role: string;
  tenant_id: string;
};

const ROLE_LABEL: Record<string, string> = {
  tenant_owner: "Dueño",
  tenant_member: "Funcionario",
};

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: ownerRole } = await supabase
    .from("user_roles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .eq("role", "tenant_owner")
    .maybeSingle();

  if (!ownerRole?.tenant_id) {
    redirect("/dashboard/requests");
  }

  const tenantId = ownerRole.tenant_id;

  const { data: roles, error: rolesError } = await supabaseAdmin
    .from("user_roles")
    .select("id,user_id,role,tenant_id")
    .eq("tenant_id", tenantId)
    .order("role");

  if (rolesError) {
    throw new Error(rolesError.message);
  }

  const typedRoles = (roles ?? []) as RoleRow[];

  const { data: usersRes, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const users = usersRes.users;
  const memberCount = typedRoles.filter((role) => role.role === "tenant_member").length;

  return (
    <div>
      <PageHeader
        eyebrow="Equipo"
        title="Usuarios"
        description="Invita funcionarios y administra quién puede gestionar solicitudes."
      >
        <div className="hidden rounded-2xl border border-[var(--color-border)] bg-white/80 px-5 py-3 text-right shadow-sm sm:block">
          <p className="text-2xl font-medium">{typedRoles.length}</p>
          <p className="text-xs text-[var(--color-muted)]">{memberCount} funcionarios</p>
        </div>
      </PageHeader>

      <Card>
        <form action={inviteTenantMember}>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Invitar funcionario
          </p>

          <div className="flex gap-2">
            <Input name="email" type="email" required placeholder="correo@ejemplo.com" className="flex-1" />

            <Button>
              <Mail className="h-4 w-4" />
              Invitar
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 space-y-3">
        {typedRoles.map((role) => {
          const roleUser = users.find((u) => u.id === role.user_id);
          const email = roleUser?.email ?? role.user_id;
          const isOwner = role.role === "tenant_owner";

          return (
            <Card key={role.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{email}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{ROLE_LABEL[role.role] ?? role.role}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={isOwner ? "gold" : "neutral"}>{ROLE_LABEL[role.role] ?? role.role}</Badge>

                  {role.role === "tenant_member" && (
                    <form action={removeTenantMember}>
                      <input type="hidden" name="userId" value={role.user_id} />

                      <Button variant="icon" className="hover:text-red-600" aria-label="Quitar funcionario">
                        <Trash2 size={22} strokeWidth={1.8} />
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {typedRoles.length === 0 && (
          <Card className="flex min-h-48 flex-col items-center justify-center text-center">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
              <Users className="h-5 w-5" />
            </div>

            <p className="mt-4 font-medium">No hay usuarios asignados</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Invita al primer funcionario para comenzar.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
