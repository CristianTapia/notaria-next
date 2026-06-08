"use client";

import { Clock, FileText, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui";
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

function formatDate(date: string) {
  const parsedDate = new Date(date);

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export default function ClientRequestsList({ tenantId }: { tenantId: string }) {
  const [clientRequests, setClientRequests] = useState<StoredClientRequest[]>([]);

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
    const hasActiveRequests = clientRequests.some((request) => !isTerminalClientRequestStatus(request.status));

    if (!hasActiveRequests) return;

    const intervalId = window.setInterval(() => {
      refreshClientRequests();
    }, 7000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshClientRequests();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clientRequests, refreshClientRequests]);

  if (clientRequests.length === 0) return null;

  return (
    <section className="min-w-0 rounded-3xl border border-[var(--color-border)] bg-white/70 p-4 shadow-sm">
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-medium">Mis solicitudes</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Seguimiento desde este teléfono</p>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-[var(--color-muted)]">
          <RefreshCw className="h-3.5 w-3.5" />
          Auto
        </div>
      </div>

      <div className="space-y-3">
        {clientRequests.map((request) => (
          <div
            key={request.requestId}
            className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white/85 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 gap-3 sm:flex-1 sm:items-center">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-[var(--color-navy)]">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="break-words text-sm font-medium">{request.documentTitle}</h3>

                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted)]">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 break-words">{formatDate(request.createdAt)}</span>
                </div>
              </div>
            </div>

            <Badge variant={STATUS_VARIANT[request.status]} className="w-fit shrink-0">
              {STATUS_LABEL[request.status]}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
