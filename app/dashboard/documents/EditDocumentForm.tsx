"use client";

import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import { Button, Input, Modal, Textarea } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { documentSchema } from "@/schemas/document";

export default function EditDocumentForm({
  documentId,
  initialTitle,
  initialDescription,
}: {
  documentId: string;
  initialTitle: string;
  initialDescription: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle(initialTitle);
    setDescription(initialDescription ?? "");
  };

  const save = async () => {
    const parsed = documentSchema.safeParse({
      title,
      description,
    });

    if (!parsed.success) {
      alert(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    const { title: cleanTitle, description: cleanDescription } = parsed.data;

    setSaving(true);

    const { error } = await supabase
      .from("documents")
      .update({
        title: cleanTitle,
        description: cleanDescription || null,
      })
      .eq("id", documentId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="icon" onClick={() => setOpen(true)} aria-label="Editar documento">
        <Pencil size={22} strokeWidth={1.8} />
      </Button>

      <Modal
        open={open}
        title="Editar documento"
        description="Modifica el nombre y la descripción que verá el cliente."
        onClose={() => {
          if (saving) return;
          reset();
          setOpen(false);
        }}
      >
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            placeholder="Título del documento"
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            placeholder="Descripción"
            rows={3}
          />

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
    </>
  );
}
