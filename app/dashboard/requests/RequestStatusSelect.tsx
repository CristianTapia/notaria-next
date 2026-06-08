"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "pending", label: "Recibida" },
  { value: "in_progress", label: "En proceso" },
  { value: "ready", label: "Lista" },
  { value: "delivered", label: "Entregada" },
  { value: "cancelled", label: "Cancelada" },
];

export default function RequestStatusSelect({
  requestId,
  initialStatus,
}: {
  requestId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (nextStatus: string) => {
    setStatus(nextStatus);
    setSaving(true);

    const { error } = await supabase
      .from("document_requests")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    setSaving(false);

    if (error) {
      alert(error.message);
      setStatus(initialStatus);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value)}
        disabled={saving}
        className="h-10 w-full min-w-0 rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10 disabled:opacity-60 sm:w-auto"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {saving && <span className="text-xs text-[var(--color-muted)]">Guardando...</span>}
    </div>
  );
}
