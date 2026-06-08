"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function CreateDocumentForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    setSaving(true);

    const { error } = await supabase.from("documents").insert({
      tenant_id: tenantId,
      title: cleanTitle,
      description: null,
      active: true,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    router.refresh();
  };

  return (
    <Card>
      <form onSubmit={submit}>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Crear documento</p>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={saving}
            placeholder="Nombre del documento"
            className="min-w-0 flex-1"
          />

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {saving ? "Creando..." : "Crear"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
