import Link from "next/link";
import { ChevronRight, FileText, ScrollText } from "lucide-react";

import { supabase } from "@/lib/supabase";
import ClientRequestsList from "./ClientRequestsList";

type Doc = {
  id: string;
  title: string;
  description: string | null;
};

export default async function ClientListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id,name,slug")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!tenant) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[var(--color-bg)] px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[calc(100vw-2rem)] items-center justify-center text-center sm:max-w-md">
          <div className="min-w-0">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
              <ScrollText className="h-5 w-5" />
            </div>

            <h1 className="break-words text-2xl font-normal">Notaría no encontrada</h1>

            <p className="mt-2 break-words text-sm text-[var(--color-muted)]">
              El enlace puede haber cambiado o la notaría ya no está disponible.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { data: docs } = await supabase
    .from("documents")
    .select("id,title,description")
    .eq("tenant_id", tenant.id)
    .eq("active", true)
    .order("sort_order")
    .order("created_at");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      <section className="mx-auto min-w-0 max-w-md px-4 py-8 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <ScrollText className="h-5 w-5" />
          </div>

          <p className="min-w-0 truncate text-sm font-medium text-[var(--color-navy)]">{tenant.name}</p>
        </div>

        <div className="mt-10 min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--color-muted)]">
            Seleccione su trámite
          </p>

          <h1 className="mt-4 break-words text-3xl font-normal leading-tight sm:text-4xl">
            ¿Qué documento <span className="italic text-[var(--color-gold)]">necesita?</span>
          </h1>

          <p className="mt-4 break-words text-sm leading-6 text-[var(--color-muted)]">
            Elija un documento, complete sus datos y revise el estado de su solicitud desde esta misma pantalla.
          </p>
        </div>

        <div className="mt-8">
          <ClientRequestsList tenantId={tenant.id} />
        </div>

        <div className="mt-8 min-w-0 space-y-4">
          {(docs ?? []).length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-6 text-center shadow-sm">
              <p className="text-sm text-[var(--color-muted)]">No hay documentos disponibles por el momento.</p>
            </div>
          ) : (
            (docs as Doc[]).map((doc) => (
              <Link
                key={doc.id}
                href={`/c/${slug}/${doc.id}`}
                className="group flex min-w-0 items-start gap-3 rounded-3xl border border-[var(--color-border)] bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-[var(--color-navy)]">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-base font-medium">{doc.title}</h2>

                  {doc.description && (
                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-[var(--color-muted)]">
                      {doc.description}
                    </p>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--color-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--color-navy)]" />
              </Link>
            ))
          )}
        </div>

        <p className="mt-10 text-center text-xs text-[var(--color-muted)]">
          Desarrollado por{" "}
          <a
            href="https://lab3c.app"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--color-navy)] underline-offset-4 hover:underline"
          >
            Lab3c.app
          </a>
        </p>
      </section>
    </main>
  );
}
