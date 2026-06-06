"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

function createSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createTenant(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("Nombre requerido");
  }

  const baseSlug = createSlug(name);

  if (!baseSlug) {
    throw new Error("No se pudo generar un slug válido");
  }

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data: existing } = await supabaseAdmin.from("tenants").select("id").eq("slug", slug).maybeSingle();

    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { error } = await supabaseAdmin.from("tenants").insert({
    name,
    slug,
    active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function updateTenant(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const currentSlug = String(formData.get("currentSlug") ?? "");
  const active = formData.get("active") === "on";
  const confirmedSlugChange = formData.get("confirmSlugChange") === "on";

  if (!id) throw new Error("Tenant requerido");
  if (!name) throw new Error("Nombre requerido");

  const nextBaseSlug = createSlug(name);

  if (!nextBaseSlug) {
    throw new Error("No se pudo generar un slug válido");
  }

  const slugWillChange = nextBaseSlug !== currentSlug;

  if (slugWillChange && !confirmedSlugChange) {
    throw new Error("Debe confirmar el cambio de link público antes de guardar.");
  }

  let nextSlug = nextBaseSlug;

  if (slugWillChange) {
    let counter = 2;

    while (true) {
      const { data: existing } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("slug", nextSlug)
        .neq("id", id)
        .maybeSingle();

      if (!existing) break;

      nextSlug = `${nextBaseSlug}-${counter}`;
      counter++;
    }
  } else {
    nextSlug = currentSlug;
  }

  const { error } = await supabaseAdmin
    .from("tenants")
    .update({
      name,
      slug: nextSlug,
      active,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteTenant(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) throw new Error("Tenant requerido");

  const { error } = await supabaseAdmin.from("tenants").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
