"use client";

import { useState } from "react";
import { createTenant } from "./actions";

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

  const slugPreview = createSlugPreview(name);

  return (
    <form action={createTenant} className="mt-6 rounded-xl border p-4">
      <h2 className="font-semibold">Crear notaría</h2>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">Nombre</label>

        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Notaría Viña del Mar"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <p className="mt-2 text-sm text-gray-500">
        URL pública: <span className="font-mono">/c/{slugPreview || "notaria-vina-del-mar"}</span>
      </p>

      <button className="mt-4 rounded-md bg-black px-4 py-2 text-white">Crear notaría</button>
    </form>
  );
}
