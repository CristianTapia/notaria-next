"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button, ConfirmModal } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function DeleteDocumentButton({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);

    const { error } = await supabase.from("documents").delete().eq("id", documentId);

    setDeleting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Documento eliminado");
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button
        type="button"
        variant="icon"
        onClick={() => setOpen(true)}
        disabled={deleting}
        className="hover:text-red-600"
        aria-label="Eliminar documento"
      >
        <Trash2 size={22} strokeWidth={1.8} />
      </Button>

      <ConfirmModal
        open={open}
        title="Eliminar documento"
        description={`¿Deseas eliminar "${documentTitle}" y todos sus campos asociados?`}
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setOpen(false);
        }}
        onConfirm={remove}
      />
    </>
  );
}
