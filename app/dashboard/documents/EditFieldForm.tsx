"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Input, Modal, Select } from "@/components/ui";
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

type Field = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  placeholder: string | null;
  options: string[] | null;
};

function getFieldTypeLabel(value: string) {
  return FIELD_TYPES.find((type) => type.value === value)?.label ?? value;
}

export default function EditFieldForm({ field }: { field: Field }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(field.label);
  const [fieldType, setFieldType] = useState(field.field_type);
  const [required, setRequired] = useState(field.required);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [optionsText, setOptionsText] = useState((field.options ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setLabel(field.label);
    setFieldType(field.field_type);
    setRequired(field.required);
    setPlaceholder(field.placeholder ?? "");
    setOptionsText((field.options ?? []).join(", "));
  };

  const save = async () => {
    const parsed = fieldSchema.safeParse({
      label,
      fieldType,
      required,
      placeholder,
      optionsText,
    });

    if (!parsed.success) {
      alert(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    const {
      label: cleanLabel,
      fieldType: cleanFieldType,
      required: cleanRequired,
      placeholder: cleanPlaceholder,
      optionsText: cleanOptionsText,
    } = parsed.data;

    setSaving(true);

    const options =
      cleanFieldType === "select"
        ? (cleanOptionsText ?? "")
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : null;

    const { error } = await supabase
      .from("document_fields")
      .update({
        label: cleanLabel,
        field_type: cleanFieldType,
        required: cleanRequired,
        placeholder: cleanPlaceholder || null,
        options,
      })
      .eq("id", field.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setOpen(false);
    router.refresh();
  };

  const remove = async () => {
    const confirmed = confirm("¿Eliminar esta pregunta?");
    if (!confirmed) return;

    setSaving(true);

    const { error } = await supabase.from("document_fields").delete().eq("id", field.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  };

  return (
    <li className="min-w-0 rounded-xl border border-[var(--color-border)] bg-white p-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm font-medium">{field.label}</p>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="neutral">{getFieldTypeLabel(field.field_type)}</Badge>
            {field.required && <Badge variant="gold">Obligatoria</Badge>}
          </div>
        </div>

        <div className="flex shrink-0 gap-1 sm:justify-end">
          <Button
            type="button"
            variant="icon"
            onClick={() => setOpen(true)}
            className="hover:text-gray-600"
            aria-label="Editar campo"
          >
            <Pencil size={22} strokeWidth={1.8} />
          </Button>

          <Button
            type="button"
            variant="icon"
            onClick={remove}
            disabled={saving}
            className="hover:text-red-600"
            aria-label="Eliminar campo"
          >
            <Trash2 size={22} strokeWidth={1.8} />
          </Button>
        </div>
      </div>

      <Modal
        open={open}
        title="Editar campo"
        description="Modifica la pregunta, el tipo de dato y si será obligatoria."
        onClose={() => {
          if (saving) return;
          reset();
          setOpen(false);
        }}
      >
        <div className="space-y-3">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
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

          <Input
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            disabled={saving}
            placeholder="Texto de ayuda / placeholder"
          />

          {fieldType === "select" && (
            <Input
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              disabled={saving}
              placeholder="Opciones separadas por coma. Ej: Sí, No, No aplica"
            />
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="button" onClick={save} disabled={saving} className="w-full sm:w-auto">
              <Check className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar cambios"}
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
        </div>
      </Modal>
    </li>
  );
}
