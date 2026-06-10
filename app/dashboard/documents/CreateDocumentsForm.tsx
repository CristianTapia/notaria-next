"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, FormField, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { documentSchema } from "@/schemas/document";
import { toast } from "sonner";

export default function CreateDocumentForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = documentSchema.safeParse({
      title,
      description: "",
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    const { title: cleanTitle } = parsed.data;

    setSaving(true);

    const { error } = await supabase.from("documents").insert({
      tenant_id: tenantId,
      title: cleanTitle,
      description: null,
      active: true,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setTitle("");
    router.refresh();
    toast.success("Documento creado");
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Crear documento</p>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end">
          <FormField label="Documento" required className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
              placeholder="Nombre del documento"
              className="min-w-0 flex-1"
            />
          </FormField>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {saving ? "Creando..." : "Crear"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
