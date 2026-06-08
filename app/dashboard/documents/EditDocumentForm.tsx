"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

import { Button, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function EditDocumentForm({
  documentId,
  initialTitle,
  initialDescription,
}: {
  documentId: string;
  initialTitle: string;
  initialDescription: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);

  const cancelEdit = () => {
    setTitle(initialTitle);
    setDescription(initialDescription ?? "");
    setEditing(false);
  };

  const save = async () => {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      alert("El título es requerido");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("documents")
      .update({
        title: cleanTitle,
        description: description.trim() || null,
      })
      .eq("id", documentId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setEditing(false);
  };

  if (!editing) {
    return (
      <Button type="button" variant="ghost" onClick={() => setEditing(true)} className="h-9 px-3">
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
    );
  }

  return (
    <div className="min-w-0 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-input)] p-3 sm:p-4">
      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          placeholder="Título del documento"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
          placeholder="Descripción"
          rows={2}
          className="w-full rounded-lg border border-[#DCD5C7] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" onClick={save} disabled={saving} className="w-full sm:w-auto">
            <Check className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>

          <Button type="button" variant="secondary" onClick={cancelEdit} disabled={saving} className="w-full sm:w-auto">
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
