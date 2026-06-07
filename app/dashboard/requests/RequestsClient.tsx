"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

import { Button, PageHeader } from "@/components/ui";
import RequestCard from "./RequestCard";
import RequestsRealtime from "./RequestsRealtime";
import { playNotificationSound } from "./notification-sound";

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

export default function RequestsClient({ tenantId, requests }: { tenantId: string; requests: RequestRow[] }) {
  const [filter, setFilter] = useState("active");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem("requests-sound") === "on";
  });

  const toggleSound = async () => {
    if (soundEnabled) {
      localStorage.removeItem("requests-sound");
      setSoundEnabled(false);
      return;
    }

    localStorage.setItem("requests-sound", "on");
    setSoundEnabled(true);

    playNotificationSound();

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const filteredRequests = requests.filter((request) => {
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
    <div>
      <RequestsRealtime tenantId={tenantId} soundEnabled={soundEnabled} />

      <PageHeader
        eyebrow="Panel de atención"
        title="Solicitudes"
        description="Solicitudes de clientes recibidas en tiempo real."
      >
        <Button type="button" variant={soundEnabled ? "secondary" : "primary"} onClick={toggleSound}>
          <Bell className="h-4 w-4" />
          {soundEnabled ? "Avisos activados" : "Activar avisos"}
        </Button>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              filter === item.value
                ? "bg-[var(--color-navy)] text-white"
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

      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No hay solicitudes para este filtro.</p>
        ) : (
          filteredRequests.map((request) => <RequestCard key={request.id} request={request} />)
        )}
      </div>
    </div>
  );
}
