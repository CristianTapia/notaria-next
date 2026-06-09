"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Input, Modal, Select } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { fieldSchema } from "@/schemas/field";

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

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setLabel("");
    setFieldType("text");
    setRequired(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = fieldSchema.safeParse({
      label,
      fieldType,
      required,
    });

    if (!parsed.success) {
      alert(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    const { label: cleanLabel, fieldType: cleanFieldType, required: cleanRequired } = parsed.data;

    setSaving(true);

    const { error } = await supabase.from("document_fields").insert({
      document_id: documentId,
      label: cleanLabel,
      field_type: cleanFieldType,
      required: cleanRequired,
      sort_order: nextSortOrder,
      placeholder: null,
      options: cleanFieldType === "select" ? ["Opción 1"] : null,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Agregar campo
      </Button>

      <Modal
        open={open}
        title="Agregar campo"
        description="Crea una nueva pregunta para este documento."
        onClose={() => {
          if (saving) return;
          setOpen(false);
        }}
      >
        <form onSubmit={submit} className="space-y-3">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            disabled={saving}
            placeholder="Texto de la pregunta"
          />

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <Select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              disabled={saving}
              className="flex-1"
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>

            <button
              type="button"
              onClick={() => setRequired((prev) => !prev)}
              disabled={saving}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition ${
                required
                  ? "border-[var(--color-gold)] bg-[#F5E9D6] text-[var(--color-navy)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-cream-input)]"
              }`}
            >
              Obligatoria
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {saving ? "Agregando..." : "Agregar pregunta"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
