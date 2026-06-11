"use client";

import { Bell, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Card, PageHeader } from "@/components/ui";
import RequestCard from "./RequestCard";
import RequestsRealtime from "./RequestsRealtime";
import { playNotificationSound } from "../notification-sound";
import { setRequestsSoundPreference, useRequestsSoundPreference } from "@/hooks/useRequestsSoundPreference";

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

const FILTERS = [
  { value: "active", label: "Activas" },
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En proceso" },
  { value: "ready", label: "Listo" },
  { value: "archived", label: "Archivadas" },
] as const;

const STATUS_PRIORITY: Record<RequestStatus, number> = {
  pending: 1,
  in_progress: 2,
  ready: 3,
  delivered: 4,
  cancelled: 5,
};

export default function RequestsClient({ tenantId, requests }: { tenantId: string; requests: RequestRow[] }) {
  const [filter, setFilter] = useState("active");
  const [highlightedRequestIds, setHighlightedRequestIds] = useState<string[]>([]);
  const soundEnabled = useRequestsSoundPreference();

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const toggleSound = async () => {
    if (soundEnabled) {
      setRequestsSoundPreference(false);
      return;
    }

    setRequestsSoundPreference(true);

    playNotificationSound();

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];

    if (statusDiff !== 0) return statusDiff;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filteredRequests = sortedRequests.filter((request) => {
    if (filter === "active") {
      return !["delivered", "cancelled"].includes(request.status);
    }

    if (filter === "archived") {
      return ["delivered", "cancelled"].includes(request.status);
    }

    return request.status === filter;
  });

  const counts = {
    active: requests.filter((request) => !["delivered", "cancelled"].includes(request.status)).length,
    pending: requests.filter((request) => request.status === "pending").length,
    in_progress: requests.filter((request) => request.status === "in_progress").length,
    ready: requests.filter((request) => request.status === "ready").length,
    archived: requests.filter((request) => ["delivered", "cancelled"].includes(request.status)).length,
  };

  return (
    <div className="min-w-0">
      <RequestsRealtime
        tenantId={tenantId}
        onNewRequest={(requestId) => {
          setHighlightedRequestIds((prev) => [...new Set([requestId, ...prev])]);

          window.setTimeout(() => {
            setHighlightedRequestIds((prev) => prev.filter((id) => id !== requestId));
          }, 12000);
        }}
      />

      <PageHeader
        eyebrow="Panel de atención"
        title="Solicitudes"
        description="Solicitudes de clientes recibidas en tiempo real."
      >
        <Button
          type="button"
          variant={soundEnabled ? "secondary" : "primary"}
          onClick={toggleSound}
          className="w-full sm:w-auto"
        >
          <Bell className="h-4 w-4" />
          {soundEnabled ? "Avisos activados" : "Activar avisos"}
        </Button>
      </PageHeader>

      <div className="mb-6 flex min-w-0 flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`min-w-0 rounded-full px-4 py-2 text-xs font-medium break-words transition-all duration-200 ${
              filter === item.value
                ? "bg-[var(--color-navy)] text-white shadow-sm"
                : "bg-white/80 text-[var(--color-muted)] hover:bg-[var(--color-cream-input)]"
            }`}
          >
            {item.label}{" "}
            <span className={filter === item.value ? "text-white/70" : "text-[var(--color-muted)]"}>
              ({counts[item.value]})
            </span>
          </button>
        ))}
      </div>

      <div className="min-w-0 space-y-3">
        {filteredRequests.length === 0 ? (
          <Card className="flex min-h-48 flex-col items-center justify-center text-center">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
              <ClipboardList className="h-5 w-5" />
            </div>

            <p className="mt-4 break-words font-medium">No hay solicitudes por ahora</p>

            <p className="mt-1 max-w-sm break-words text-sm text-[var(--color-muted)]">
              Cuando un cliente complete un formulario desde el QR, aparecerá automáticamente en este panel.
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isNew={highlightedRequestIds.includes(request.id)}
              now={now}
            />
          ))
        )}
      </div>
    </div>
  );
}
