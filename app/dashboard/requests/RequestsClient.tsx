"use client";

import { Bell } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

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

const REQUESTS_SOUND_EVENT = "requests-sound-change";
let soundPreferenceHydrated = false;

function subscribeToSoundPreference(onStoreChange: () => void) {
  window.addEventListener(REQUESTS_SOUND_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  const timeoutId = window.setTimeout(() => {
    soundPreferenceHydrated = true;
    onStoreChange();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
    window.removeEventListener(REQUESTS_SOUND_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSoundPreferenceSnapshot() {
  if (!soundPreferenceHydrated) return false;

  return localStorage.getItem("requests-sound") === "on";
}

function getServerSoundPreferenceSnapshot() {
  return false;
}

export default function RequestsClient({ tenantId, requests }: { tenantId: string; requests: RequestRow[] }) {
  const [filter, setFilter] = useState("active");
  const soundEnabled = useSyncExternalStore(
    subscribeToSoundPreference,
    getSoundPreferenceSnapshot,
    getServerSoundPreferenceSnapshot,
  );

  const toggleSound = async () => {
    if (soundEnabled) {
      localStorage.removeItem("requests-sound");
      window.dispatchEvent(new Event(REQUESTS_SOUND_EVENT));
      return;
    }

    localStorage.setItem("requests-sound", "on");
    window.dispatchEvent(new Event(REQUESTS_SOUND_EVENT));

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
    <div className="min-w-0">
      <RequestsRealtime tenantId={tenantId} soundEnabled={soundEnabled} />

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
            className={`min-w-0 rounded-full px-4 py-2 text-xs font-medium break-words transition ${
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

      <div className="min-w-0 space-y-3">
        {filteredRequests.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No hay solicitudes para este filtro.</p>
        ) : (
          filteredRequests.map((request) => <RequestCard key={request.id} request={request} />)
        )}
      </div>
    </div>
  );
}
