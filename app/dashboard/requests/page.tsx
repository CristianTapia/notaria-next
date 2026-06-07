import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import RequestsClient from "./RequestsClient";

type RoleRow = {
  role: string;
  tenant_id: string | null;
};

type RequestStatus = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

type RequestRow = {
  id: string;
  status: RequestStatus;
  data: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  documents: {
    title: string;
  } | null;
};

export default async function DashboardRequestsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase.from("user_roles").select("role, tenant_id").eq("user_id", user.id);

  const typedRoles = (roles ?? []) as RoleRow[];

  const tenantRole = typedRoles.find((role) => role.role === "tenant_owner" || role.role === "tenant_member");

  if (!tenantRole?.tenant_id) {
    redirect("/dashboard");
  }

  const { data: requests, error } = await supabase
    .from("document_requests")
    .select(
      `
      id,
      status,
      data,
      notes,
      created_at,
      documents (
        title
      )
    `,
    )
    .eq("tenant_id", tenantRole.tenant_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const typedRequests = (requests ?? []) as unknown as RequestRow[];

  return <RequestsClient tenantId={tenantRole.tenant_id} requests={typedRequests} />;
}
