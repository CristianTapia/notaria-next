"use client";

import { FileText, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge, Button, DateTimeMeta } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import {
  getStoredClientRequests,
  isTerminalClientRequestStatus,
  mergeClientRequestStatusUpdates,
  type ClientRequestStatus,
  type StoredClientRequest,
} from "@/lib/client-requests-storage";

const STATUS_LABEL: Record<ClientRequestStatus, string> = {
  pending: "Recibida",
  in_progress: "En proceso",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

const STATUS_VARIANT: Record<ClientRequestStatus, "gold" | "blue" | "green" | "neutral" | "red"> = {
  pending: "gold",
  in_progress: "blue",
  ready: "green",
  delivered: "neutral",
  cancelled: "red",
};

function RequestMiniCard({
  request,
  onCancel,
  cancelling,
}: {
  request: StoredClientRequest;
  onCancel: (request: StoredClientRequest) => void;
  cancelling: boolean;
}) {
  const canCancel = request.status === "pending" || request.status === "in_progress";
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white/85 p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
          <FileText className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-medium leading-5">{request.documentTitle}</h3>

          <div className="mt-2">
            <DateTimeMeta value={request.createdAt} />
          </div>

          <div className="mt-3">
            <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABEL[request.status]}</Badge>
            {canCancel && (
              <Button
                type="button"
                variant="secondary"
                disabled={cancelling}
                onClick={() => onCancel(request)}
                className="mt-3 h-9 w-full text-xs"
              >
                {cancelling ? "Cancelando..." : "Cancelar solicitud"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientRequestsList({ tenantId }: { tenantId: string }) {
  const [clientRequests, setClientRequests] = useState<StoredClientRequest[]>([]);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);

  const cancelClientRequest = async (request: StoredClientRequest) => {
    setCancellingRequestId(request.requestId);

    const { data, error } = await supabase.rpc("cancel_client_document_request", {
      p_request_id: request.requestId,
      p_tracking_token: request.trackingToken,
    });

    setCancellingRequestId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data || data.length === 0) {
      toast.error("No se pudo cancelar esta solicitud. Puede que ya esté lista o finalizada.");
      return;
    }

    const next = mergeClientRequestStatusUpdates(tenantId, data);
    setClientRequests(next);

    toast.success("Solicitud cancelada");
  };

  const refreshClientRequests = useCallback(async () => {
    const stored = getStoredClientRequests(tenantId);

    if (stored.length === 0) {
      setClientRequests([]);
      return;
    }

    const { data, error } = await supabase.rpc("get_client_document_requests", {
      p_requests: stored.map((request) => ({
        request_id: request.requestId,
        tracking_token: request.trackingToken,
      })),
    });

    if (error) {
      setClientRequests(stored);
      return;
    }

    const next = mergeClientRequestStatusUpdates(tenantId, data ?? []);
    setClientRequests(next);
  }, [tenantId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const stored = getStoredClientRequests(tenantId);

      if (stored.length === 0) {
        if (!cancelled) setClientRequests([]);
        return;
      }

      const { data, error } = await supabase.rpc("get_client_document_requests", {
        p_requests: stored.map((request) => ({
          request_id: request.requestId,
          tracking_token: request.trackingToken,
        })),
      });

      if (cancelled) return;

      if (error) {
        setClientRequests(stored);
        return;
      }

      const next = mergeClientRequestStatusUpdates(tenantId, data ?? []);
      setClientRequests(next);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  useEffect(() => {
    const activeRequestIds = clientRequests
      .filter((request) => !isTerminalClientRequestStatus(request.status))
      .map((request) => request.requestId);

    if (activeRequestIds.length === 0) return;

    const activeIds = new Set(activeRequestIds);

    const channel = supabase
      .channel(`client-requests-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "document_requests",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const updatedId = typeof payload.new?.id === "string" ? payload.new.id : null;

          if (!updatedId || !activeIds.has(updatedId)) return;

          refreshClientRequests();
        },
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshClientRequests();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tenantId, clientRequests, refreshClientRequests]);

  if (clientRequests.length === 0) return null;

  const activeRequests = clientRequests.filter((request) => !isTerminalClientRequestStatus(request.status));

  const archivedRequests = clientRequests.filter((request) => isTerminalClientRequestStatus(request.status));

  return (
    <section className="space-y-4">
      {activeRequests.length > 0 && (
        <div className="rounded-3xl border border-[var(--color-border)] bg-white/70 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Mis solicitudes activas</h2>
              <p className="mt-1 text-xs text-[var(--color-muted)]">Seguimiento desde este teléfono</p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-[var(--color-muted)]">
              <RefreshCw className="h-3.5 w-3.5" />
              Auto
            </div>
          </div>

          <div className="space-y-3">
            {activeRequests.map((request) => (
              <RequestMiniCard
                key={request.requestId}
                request={request}
                onCancel={cancelClientRequest}
                cancelling={cancellingRequestId === request.requestId}
              />
            ))}
          </div>
        </div>
      )}

      {archivedRequests.length > 0 && (
        <details className="rounded-3xl border border-[var(--color-border)] bg-white/50 p-4 shadow-sm">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-medium">Historial</h2>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {archivedRequests.length} solicitudes finalizadas
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-[var(--color-muted)]">Ver</span>
            </div>
          </summary>

          <div className="mt-4 space-y-3">
            {archivedRequests.map((request) => (
              <RequestMiniCard
                key={request.requestId}
                request={request}
                onCancel={cancelClientRequest}
                cancelling={cancellingRequestId === request.requestId}
              />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
