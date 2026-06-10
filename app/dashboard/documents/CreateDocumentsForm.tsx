"use client";

import { Plus, FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, FormField, Input, Textarea, Modal } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { documentSchema } from "@/schemas/document";
import { toast } from "sonner";

export default function CreateDocumentForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = documentSchema.safeParse({
      title,
      description,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    const { title: cleanTitle, description: cleanDescription } = parsed.data;

    setSaving(true);

    const { error } = await supabase.from("documents").insert({
      tenant_id: tenantId,
      title: cleanTitle,
      description: cleanDescription || null,
      active: true,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setOpen(false);
    router.refresh();
    toast.success("Documento creado");
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Crear documento
      </Button>

      <Modal
        open={open}
        title="Crear documento"
        description="Agrega un nuevo documento disponible para clientes."
        onClose={() => {
          if (saving) return;
          setOpen(false);
        }}
        icon={<FilePlus className="h-6 w-6" />}
        size="md"
        disableClose={saving}
      >
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Documento" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
              placeholder="Nombre del documento"
            />
          </FormField>

          <FormField label="Descripción">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              placeholder="Ej: Complete este formulario para solicitar este documento."
              rows={3}
            />
          </FormField>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {saving ? "Creando..." : "Crear documento"}
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
