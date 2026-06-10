"use client";

import { AlertTriangle } from "lucide-react";

import { Button, Modal } from "@/components/ui";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      size="sm"
      disableClose={loading}
      icon={<AlertTriangle className={danger ? "h-6 w-6 text-red-600" : "h-6 w-6"} />}
    >
      {danger && <p className="mx-auto max-w-sm text-center text-sm text-red-600">Esta acción no se puede deshacer.</p>}

      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-40">
          {cancelLabel}
        </Button>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`w-full sm:w-40 ${danger ? "bg-red-600 text-white hover:bg-red-700" : ""}`}
        >
          {loading ? "Procesando..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
