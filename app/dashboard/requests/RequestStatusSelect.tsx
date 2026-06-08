"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Select } from "@/components/ui";

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
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Select value={status} onChange={(e) => updateStatus(e.target.value)} disabled={saving} className="sm:max-w-xs">
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {saving && <span className="text-xs text-[var(--color-muted)]">Guardando...</span>}
    </div>
  );
}
