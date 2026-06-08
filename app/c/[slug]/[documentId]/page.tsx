import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";

import { supabase } from "@/lib/supabase";
import ClientDocumentForm from "./ClientDocumentForm";

type Field = {
  id: string;
  label: string;
  field_type: "text" | "email" | "phone" | "number" | "date" | "textarea" | "select";
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
};

export default async function DocumentPage({ params }: { params: Promise<{ slug: string; documentId: string }> }) {
  const { slug, documentId } = await params;

  const [{ data: tenant }, { data: doc }, { data: fields }] = await Promise.all([
    supabase.from("tenants").select("id,name,slug").eq("slug", slug).eq("active", true).maybeSingle(),

    supabase
      .from("documents")
      .select("id,title,description,tenant_id")
      .eq("id", documentId)
      .eq("active", true)
      .maybeSingle(),

    supabase
      .from("document_fields")
      .select("id,label,field_type,placeholder,required,options")
      .eq("document_id", documentId)
      .order("sort_order"),
  ]);

  if (!tenant || !doc) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[var(--color-bg)] px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[calc(100vw-2rem)] items-center justify-center text-center sm:max-w-md">
          <div className="min-w-0">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
              <ScrollText className="h-5 w-5" />
            </div>

            <h1 className="break-words text-2xl font-normal">Documento no disponible</h1>

            <p className="mt-2 break-words text-sm text-[var(--color-muted)]">
              Este documento ya no está disponible o el enlace cambió.
            </p>

            <Link
              href={`/c/${slug}`}
              className="mt-6 inline-flex text-sm font-medium text-[var(--color-navy)] underline-offset-4 hover:underline"
            >
              Volver al listado
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-white/50">
        <div className="mx-auto flex min-w-0 max-w-3xl items-center gap-2 px-4 py-4 sm:px-6">
          <ScrollText className="h-5 w-5 text-[var(--color-gold)]" />
          <p className="min-w-0 break-words text-base font-medium">{tenant.name}</p>
        </div>
      </header>

      <section className="mx-auto min-w-0 max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href={`/c/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-navy)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Otros documentos
        </Link>

        <div className="mt-8 min-w-0">
          <h1 className="break-words text-3xl font-normal sm:text-4xl">{doc.title}</h1>

          {doc.description && <p className="mt-4 break-words text-sm leading-6 text-[var(--color-muted)]">{doc.description}</p>}
        </div>

        <ClientDocumentForm doc={doc} fields={(fields as Field[] | null) ?? []} slug={slug} />
      </section>
    </main>
  );
}
