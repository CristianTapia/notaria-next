"use client";

import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui";
import CreateFieldForm from "./CreateFieldForm";
import DocumentActiveToggle from "./DocumentActiveToggle";
import EditDocumentForm from "./EditDocumentForm";
import EditFieldForm from "./EditFieldForm";
import DeleteDocumentButton from "./DeleteDocumentButton";

type DocumentFieldRow = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  placeholder: string | null;
  options: string[] | null;
  sort_order: number | null;
};

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
  document_fields: DocumentFieldRow[];
};

export default function DocumentCard({ doc }: { doc: DocumentRow }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="min-w-0 flex flex-1 items-start gap-3 text-left"
        >
          <span
            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)] transition ${
              open ? "rotate-0" : ""
            }`}
          >
            <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
          </span>

          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-2">
              <FileText className="h-4 w-4 shrink-0 text-[var(--color-gold)]" />
              <h2 className="break-words text-base font-medium">{doc.title}</h2>
            </div>

            {doc.description && (
              <p className="mt-1 line-clamp-2 break-words text-sm text-[var(--color-muted)]">{doc.description}</p>
            )}

            <p className="mt-1 text-xs text-[var(--color-muted)]">{doc.document_fields.length} campos configurados</p>
          </div>
        </button>

        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
          <DocumentActiveToggle documentId={doc.id} initialActive={doc.active} />

          <EditDocumentForm documentId={doc.id} initialTitle={doc.title} initialDescription={doc.description} />
          <DeleteDocumentButton documentId={doc.id} documentTitle={doc.title} />
        </div>
      </div>

      {open && (
        <div className="mt-5 space-y-4 border-t border-[var(--color-border)] pt-5">
          <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-input)] p-3 sm:p-4">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h3 className="text-sm font-medium">Campos del formulario</h3>

              <span className="text-xs text-[var(--color-muted)]">{doc.document_fields.length} campos</span>
            </div>

            {doc.document_fields.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">Este documento aún no tiene campos.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {doc.document_fields.map((field) => (
                  <EditFieldForm key={field.id} field={field} />
                ))}
              </ul>
            )}
          </div>

          <CreateFieldForm documentId={doc.id} nextSortOrder={(doc.document_fields?.length ?? 0) + 1} />
        </div>
      )}
    </Card>
  );
}
