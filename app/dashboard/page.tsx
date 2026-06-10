import { CheckCircle2, ClipboardList, Clock3, FileText, Inbox, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RoleRow = {
  id: string;
  role: string;
  tenant_id: string | null;
};

type RequestStatus = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

type RecentRequest = {
  id: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  documents:
    | {
        title: string;
      }
    | {
        title: string;
      }[]
    | null;
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Recibida",
  in_progress: "En proceso",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

const STATUS_VARIANT: Record<RequestStatus, "gold" | "blue" | "green" | "neutral" | "red"> = {
  pending: "gold",
  in_progress: "blue",
  ready: "green",
  delivered: "neutral",
  cancelled: "red",
};

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function endOfMonthLabel() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
  }).format(end);
}

function getDocumentTitle(documents: RecentRequest["documents"]) {
  if (!documents) return "Documento";
  if (Array.isArray(documents)) return documents[0]?.title ?? "Documento";
  return documents.title;
}

function formatRelativeDate(date: string) {
  const parsedDate = new Date(date);
  const diffMs = Date.now() - parsedDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Hace un momento";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return `Hace ${diffDays} d`;
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--color-cream-input)] px-4 py-3">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("id, role, tenant_id")
    .eq("user_id", user.id);

  if (rolesError) throw new Error(rolesError.message);

  const typedRoles = (roles ?? []) as RoleRow[];

  const isSuperAdmin = typedRoles.some((role) => role.role === "super_admin");
  const tenantRole = typedRoles.find((role) => role.role === "tenant_owner" || role.role === "tenant_member");
  const isTenantOwner = typedRoles.some((role) => role.role === "tenant_owner");

  if (isSuperAdmin) redirect("/admin");
  if (!isTenantOwner) redirect("/dashboard/requests");

  if (!tenantRole?.tenant_id) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] p-8">
        <Card>
          <h1 className="text-2xl font-medium">Cuenta sin notaría asignada</h1>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Su cuenta existe, pero aún no tiene una notaría asignada.
          </p>
        </Card>
      </main>
    );
  }

  const monthStart = startOfMonthIso();

  const [
    { count: requestsThisMonth },
    { count: deliveredThisMonth },
    { count: cancelledThisMonth },
    { count: activeRequests },
    { count: visibleDocuments },
    { count: pendingRequests },
    { count: inProgressRequests },
    { count: readyRequests },
    { data: recentRequests },
  ] = await Promise.all([
    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .gte("created_at", monthStart),

    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .eq("status", "delivered")
      .gte("delivered_at", monthStart),

    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .eq("status", "cancelled")
      .gte("updated_at", monthStart),

    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .in("status", ["pending", "in_progress", "ready"]),

    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .eq("active", true)
      .is("archived_at", null),

    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .eq("status", "pending"),

    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .eq("status", "in_progress"),

    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantRole.tenant_id)
      .eq("status", "ready"),

    supabase
      .from("document_requests")
      .select(
        `
        id,
        status,
        created_at,
        updated_at,
        documents (
          title
        )
      `,
      )
      .eq("tenant_id", tenantRole.tenant_id)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const typedRecentRequests = (recentRequests ?? []) as RecentRequest[];

  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Resumen" title="Inicio" description="Vista general de la operación mensual de la notaría." />

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Solicitudes del mes"
          value={requestsThisMonth ?? 0}
          description="Total recibidas este mes"
          icon={<ClipboardList className="h-5 w-5" />}
        />

        <StatCard
          title="Entregadas"
          value={deliveredThisMonth ?? 0}
          description="Cuentan para cobro"
          icon={<FileText className="h-5 w-5" />}
        />

        <StatCard
          title="Canceladas"
          value={cancelledThisMonth ?? 0}
          description="Históricas no cobrables"
          icon={<XCircle className="h-5 w-5" />}
        />

        <StatCard
          title="Activas"
          value={activeRequests ?? 0}
          description="Recibidas, en proceso o listas"
          icon={<Inbox className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[var(--color-gold)]/10" />

          <p className="text-sm text-[var(--color-muted)]">Uso para facturación</p>
          <p className="mt-3 text-4xl font-medium tracking-[-0.05em]">{deliveredThisMonth ?? 0} docs</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Documentos entregados durante el mes actual.</p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
            <span className="rounded-full bg-[var(--color-cream-input)] px-3 py-1">
              Cierre estimado: {endOfMonthLabel()}
            </span>
            <span className="rounded-full bg-[var(--color-cream-input)] px-3 py-1">Base de cobro mensual</span>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-[var(--color-muted)]">Documentos visibles</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">{visibleDocuments ?? 0}</p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Documentos disponibles para clientes en el portal público.
          </p>
        </Card>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-medium">Estado actual</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Solicitudes que requieren seguimiento.</p>
            </div>

            <Clock3 className="h-5 w-5 text-[var(--color-gold)]" />
          </div>

          <div className="space-y-2">
            <StatusRow label="Recibidas" value={pendingRequests ?? 0} />
            <StatusRow label="En proceso" value={inProgressRequests ?? 0} />
            <StatusRow label="Listas" value={readyRequests ?? 0} />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-medium">Actividad reciente</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Últimos movimientos registrados.</p>
            </div>

            <CheckCircle2 className="h-5 w-5 text-[var(--color-gold)]" />
          </div>

          {typedRecentRequests.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">Aún no hay solicitudes registradas.</p>
          ) : (
            <div className="space-y-2">
              {typedRecentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-[var(--color-cream-input)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{getDocumentTitle(request.documents)}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{formatRelativeDate(request.updated_at)}</p>
                  </div>

                  <Badge variant={STATUS_VARIANT[request.status]} className="shrink-0">
                    {STATUS_LABEL[request.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
