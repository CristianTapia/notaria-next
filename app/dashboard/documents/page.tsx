import { Inbox } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, PageHeader } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreateDocumentForm from "./CreateDocumentsForm";
import DocumentCard from "./DocumentCard";

type RoleRow = {
  role: string;
  tenant_id: string | null;
};

type DocumentFieldRow = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  placeholder: string | null;
  options: string[] | null;
  sort_order: number | null;
};

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
  document_fields: DocumentFieldRow[];
};

export default async function DashboardDocumentsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles } = await supabase.from("user_roles").select("role, tenant_id").eq("user_id", user.id);

  const typedRoles = (roles ?? []) as RoleRow[];

  const tenantRole = typedRoles.find((role) => role.role === "tenant_owner");

  if (!tenantRole?.tenant_id) {
    redirect("/dashboard/requests");
  }

  const { data: documents, error } = await supabase
    .from("documents")
    .select(
      `
      id,
      title,
      description,
      active,
      created_at,
      document_fields (
        id,
        label,
        field_type,
        required,
        placeholder,
        options,
        sort_order
      )
    `,
    )
    .eq("tenant_id", tenantRole.tenant_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const typedDocuments = (documents ?? []) as DocumentRow[];
  const activeCount = typedDocuments.filter((doc) => doc.active).length;

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Configuración"
        title="Documentos"
        description="Crea los documentos disponibles para clientes y define los campos que deben completar."
      >
        <div className="hidden rounded-2xl border border-[var(--color-border)] bg-white/80 px-5 py-3 text-right shadow-sm sm:block">
          <p className="text-2xl font-medium">{typedDocuments.length}</p>
          <p className="text-xs text-[var(--color-muted)]">{activeCount} visibles</p>
        </div>
      </PageHeader>

      <CreateDocumentForm tenantId={tenantRole.tenant_id} />

      <div className="mt-6 min-w-0 space-y-4">
        {typedDocuments.length === 0 ? (
          <Card className="flex min-h-48 flex-col items-center justify-center text-center">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
              <Inbox className="h-5 w-5" />
            </div>

            <p className="mt-4 break-words font-medium">No hay documentos todavía</p>
            <p className="mt-1 break-words text-sm text-[var(--color-muted)]">
              Crea el primer documento para comenzar a recibir solicitudes.
            </p>
          </Card>
        ) : (
          typedDocuments.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
        )}
      </div>
    </div>
  );
}
