import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RequestStatusSelect from "./RequestStatusSelect";
import RequestsRealtime from "./RequestsRealtime";

type RoleRow = {
  role: string;
  tenant_id: string | null;
};

type RequestDocument = {
  title: string;
};

type RequestRow = {
  id: string;
  status: string;
  data: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  documents: {
    title: string;
  } | null;
};

function getDocumentTitle(documents: RequestRow["documents"]) {
  if (Array.isArray(documents)) {
    return documents[0]?.title ?? "Documento";
  }

  return documents?.title ?? "Documento";
}

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

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Solicitudes</h1>

      <RequestsRealtime tenantId={tenantRole.tenant_id} />

      <div className="mt-6 space-y-4">
        {typedRequests.length === 0 ? (
          <p className="text-gray-500">No hay solicitudes todavía.</p>
        ) : (
          typedRequests.map((request) => (
            <div key={request.id} className="rounded-xl border p-4">
              <p className="font-semibold">{request.documents?.title ?? "Documento"}</p>

              <p className="text-sm text-gray-500">Estado: {request.status}</p>

              <RequestStatusSelect
                key={`${request.id}-${request.status}`}
                requestId={request.id}
                initialStatus={request.status}
              />

              <p className="text-xs text-gray-400">{new Date(request.created_at).toLocaleString("es-ES")}</p>

              {request.data && (
                <pre className="mt-3 overflow-auto rounded p-3 text-xs">{JSON.stringify(request.data, null, 2)}</pre>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
