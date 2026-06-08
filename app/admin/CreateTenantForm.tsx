"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";

import { Button, Card, Input } from "@/components/ui";
import { createTenant } from "./actions";

const initialState = {
  ok: false,
  message: "",
  createdName: "",
};

function createSlugPreview(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateTenantForm() {
  const [name, setName] = useState("");

  const [state, formAction, pending] = useActionState(createTenant, initialState);

  const submitAction = async (formData: FormData) => {
    await formAction(formData);
    setName("");
  };

  const slugPreview = createSlugPreview(name);

  return (
    <Card>
      <form action={submitAction}>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            name="name"
            required
            disabled={pending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la notaría"
          />

          <div className="flex min-h-11 min-w-0 items-center rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-4 font-mono text-sm break-all text-[var(--color-muted)]">
            /c/{slugPreview || "slug-url"}
          </div>
        </div>

        {state.message && (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
              state.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex min-w-0 items-start gap-2">
              {state.ok && <CheckCircle2 className="h-4 w-4" />}
              <span className="min-w-0 break-words">
                {state.message}
                {state.ok && state.createdName ? `: ${state.createdName}` : ""}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {pending ? "Creando..." : "Crear notaría"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
