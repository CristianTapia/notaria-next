"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";

const FIELD_TYPES = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "email", label: "Correo" },
  { value: "phone", label: "Teléfono" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "select", label: "Lista" },
];

export default function CreateFieldForm({ documentId, nextSortOrder }: { documentId: string; nextSortOrder: number }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanLabel = label.trim();

    if (!cleanLabel) return;

    setSaving(true);

    const { error } = await supabase.from("document_fields").insert({
      document_id: documentId,
      label: cleanLabel,
      field_type: fieldType,
      required,
      sort_order: nextSortOrder,
      placeholder: null,
      options: fieldType === "select" ? ["Opción 1"] : null,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setLabel("");
    setFieldType("text");
    setRequired(false);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="min-w-0 rounded-xl border border-[var(--color-border)] bg-white/70 p-3 sm:p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Agregar campo</p>

      <div className="space-y-3">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          disabled={saving}
          placeholder="Texto de la pregunta"
        />

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            disabled={saving}
            className="h-11 min-w-0 flex-1 rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10 disabled:opacity-60"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setRequired((prev) => !prev)}
            disabled={saving}
            className={`h-11 rounded-lg border px-3 text-sm font-medium transition ${
              required
                ? "border-[var(--color-gold)] bg-[#F5E9D6] text-[var(--color-navy)]"
                : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-cream-input)]"
            }`}
          >
            Obligatoria
          </button>
        </div>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          {saving ? "Agregando..." : "Agregar pregunta"}
        </Button>
      </div>
    </form>
  );
}
