"use client";

import { Check, Pencil, Trash2, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, ConfirmModal, FormField, Input, Modal, Select, Switch } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { fieldSchema } from "@/schemas/field";
import { toast } from "sonner";

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
  const [saving, setSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [label, setLabel] = useState(field.label);
  const [fieldType, setFieldType] = useState(field.field_type);
  const [required, setRequired] = useState(field.required);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [optionsText, setOptionsText] = useState((field.options ?? []).join(", "));

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
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
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
      toast.error(error.message);
      return;
    }

    setOpen(false);
    router.refresh();
    toast.success("Campo actualizado");
  };

  const remove = async () => {
    setSaving(true);

    const { error: deleteError } = await supabase.from("document_fields").delete().eq("id", field.id);

    if (!deleteError) {
      setSaving(false);
      router.refresh();
      toast.success("Campo eliminado");
      return;
    }

    const { error: archiveError } = await supabase
      .from("document_fields")
      .update({
        archived_at: new Date().toISOString(),
      })
      .eq("id", field.id);

    setSaving(false);

    if (archiveError) {
      toast.error(archiveError.message);
      return;
    }

    router.refresh();
    toast.success("Campo archivado");
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
            onClick={() => setConfirmDeleteOpen(true)}
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
        description="Modifica el campo, el tipo de dato y si será obligatorio."
        onClose={() => {
          if (saving) return;
          reset();
          setOpen(false);
        }}
        icon={<ListChecks className="h-6 w-6" />}
        size="md"
        disableClose={saving}
      >
        <div className="space-y-5">
          <FormField label="Campo" required>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={saving}
              placeholder="Texto del campo"
            />
          </FormField>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-end">
            <FormField label="Tipo de campo" required className="flex-1">
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

          {fieldType === "select" && (
            <FormField label="Opciones">
              <Input
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                disabled={saving}
                placeholder="Opciones separadas por coma. Ej: Sí, No, No aplica"
              />
            </FormField>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="button" onClick={save} disabled={saving} className="w-full sm:w-auto">
              <Check className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar"}
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

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Quitar Campo"
        description="Si este campo ya tiene historial, será archivada para conservar los datos antiguos."
        confirmLabel="Quitar"
        danger
        loading={saving}
        onClose={() => {
          if (saving) return;
          setConfirmDeleteOpen(false);
        }}
        onConfirm={async () => {
          setConfirmDeleteOpen(false);
          await remove();
        }}
      />
    </li>
  );
}
