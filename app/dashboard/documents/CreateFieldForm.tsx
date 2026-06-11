"use client";

import { Plus, ListPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, FormField, Input, Modal, Select, Switch } from "@/components/ui";
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
  const [fieldType, setFieldType] = useState("");
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [placeholder, setPlaceholder] = useState("");

  const reset = () => {
    setLabel("");
    setFieldType("");
    setRequired(false);
    setPlaceholder("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = fieldSchema.safeParse({
      label,
      fieldType,
      required,
      placeholder,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    const {
      label: cleanLabel,
      fieldType: cleanFieldType,
      required: cleanRequired,
      placeholder: cleanPlaceholder,
    } = parsed.data;

    setSaving(true);

    const { error } = await supabase.from("document_fields").insert({
      document_id: documentId,
      label: cleanLabel,
      field_type: cleanFieldType,
      required: cleanRequired,
      sort_order: nextSortOrder,
      placeholder: cleanPlaceholder || null,
      options: cleanFieldType === "select" ? ["Opción 1"] : null,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
    toast.success("Campo agregado");
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
        description="Crea un nuevo campo para este documento."
        onClose={() => {
          if (saving) return;
          reset();
          setOpen(false);
        }}
        icon={<ListPlus className="h-6 w-6" />}
        size="md"
        disableClose={saving}
      >
        <form onSubmit={submit} className="space-y-5">
          <FormField label="Campo" required>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              disabled={saving}
              placeholder="Texto del campo"
            />
          </FormField>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-end">
            <FormField label="Tipo de campo" required className="flex-1">
              <Select value={fieldType} onChange={(e) => setFieldType(e.target.value)} disabled={saving}>
                <option value="" disabled>
                  Selecciona un tipo de campo
                </option>

                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="flex h-11 items-center justify-start sm:mb-0.5">
              <Switch
                checked={required}
                disabled={saving}
                onClick={() => setRequired((prev) => !prev)}
                label={required ? "Obligatorio" : "Opcional"}
              />
            </div>
          </div>

          <FormField label="Texto de ayuda">
            <Input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              disabled={saving}
              placeholder="Texto de ayuda / placeholder"
            />
          </FormField>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {saving ? "Agregando..." : "Agregar"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                setOpen(false);
              }}
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
