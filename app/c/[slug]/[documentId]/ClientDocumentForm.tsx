"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, FormField, Input, Select, Textarea } from "@/components/ui";
import { saveClientRequest } from "@/lib/client-requests-storage";
import { supabase } from "@/lib/supabase";
import { BadgeCheck, CheckCircle2, CircleX, Clock, Info, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const STATUS_STEP: Record<string, number> = {
  pending: 0,
  in_progress: 1,
  ready: 2,
  delivered: 3,
  cancelled: -1,
};

const STATUS_MESSAGE: Record<string, string> = {
  pending: "Su solicitud fue recibida. Pronto la atenderemos.",
  in_progress: "Estamos revisando su solicitud.",
  ready: "Su documento está listo.",
  delivered: "Su documento fue entregado.",
  cancelled: "Su solicitud fue cancelada.",
};

const STEPS = [
  { key: "pending", label: "Recibida" },
  { key: "in_progress", label: "En proceso" },
  { key: "ready", label: "Lista" },
  { key: "delivered", label: "Entregada" },
];

function renderStatusIcon(status: string) {
  if (status === "in_progress") {
    return <LoaderCircle className="h-7 w-7 animate-spin" />;
  }

  if (status === "ready") {
    return <BadgeCheck className="h-7 w-7" />;
  }

  if (status === "delivered") {
    return <CheckCircle2 className="h-7 w-7" />;
  }

  if (status === "cancelled") {
    return <CircleX className="h-7 w-7" />;
  }

  return <Clock className="h-7 w-7" />;
}

function isActiveStatus(status: string) {
  return status === "pending" || status === "in_progress" || status === "ready";
}

type Field = {
  id: string;
  label: string;
  field_type: "text" | "email" | "phone" | "number" | "date" | "textarea" | "select";
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
};

type Doc = {
  id: string;
  title: string;
  tenant_id: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Recibida",
  in_progress: "En proceso",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

function getInputType(fieldType: Field["field_type"]) {
  if (fieldType === "email") return "email";
  if (fieldType === "phone") return "tel";
  if (fieldType === "number") return "number";
  if (fieldType === "date") return "date";

  return "text";
}

export default function ClientDocumentForm({ doc, fields, slug }: { doc: Doc; fields: Field[]; slug: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [requestId, setRequestId] = useState<string | null>(null);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");

  const refreshCurrentRequest = useCallback(async () => {
    if (!requestId || !trackingToken) return;

    const { data, error } = await supabase.rpc("get_client_document_requests", {
      p_requests: [
        {
          request_id: requestId,
          tracking_token: trackingToken,
        },
      ],
    });

    if (error) return;

    const current = data?.[0];
    if (!current) return;

    setStatus(current.status ?? "pending");
  }, [requestId, trackingToken]);

  useEffect(() => {
    if (!requestId || !trackingToken) return;

    const channel = supabase
      .channel(`client-request-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "document_requests",
          filter: `id=eq.${requestId}`,
        },
        () => {
          refreshCurrentRequest();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, trackingToken, refreshCurrentRequest]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    const data: Record<string, string> = {};

    fields.forEach((field) => {
      data[field.label] = values[field.id] ?? "";
    });

    const { data: inserted, error } = await supabase.rpc("create_client_document_request", {
      p_document_id: doc.id,
      p_tenant_id: doc.tenant_id,
      p_data: data,
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const request = inserted?.[0];

    if (!request) {
      toast.error("No se pudo obtener la solicitud creada.");
      return;
    }

    setRequestId(request.request_id);
    setTrackingToken(request.tracking_token);
    setStatus(request.status ?? "pending");

    saveClientRequest({
      requestId: request.request_id,
      trackingToken: request.tracking_token,
      tenantId: doc.tenant_id,
      slug,
      documentId: doc.id,
      documentTitle: request.document_title,
      status: request.status ?? "pending",
      createdAt: request.created_at,
    });
  };

  if (requestId) {
    const currentStep = STATUS_STEP[status] ?? 0;
    const shouldAnimate = isActiveStatus(status);

    return (
      <Card className="mt-8 text-center">
        <div
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-gold)]/20 text-[var(--color-navy)] ${
            shouldAnimate ? "animate-pulse" : ""
          }`}
        >
          {renderStatusIcon(status)}
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-[var(--color-muted)]">Estado actual</p>

        <h2 className="mt-2 break-words text-2xl font-normal sm:text-3xl">{STATUS_LABEL[status] ?? status}</h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
          {STATUS_MESSAGE[status] ?? "Su solicitud fue enviada correctamente."}
        </p>

        <p className="mt-5 break-words text-sm font-medium">{doc.title}</p>

        {status !== "cancelled" && (
          <div className="mx-auto mt-8 min-w-0 max-w-xs text-left">
            {STEPS.map((step, index) => {
              const completed = index < currentStep;
              const current = index === currentStep;
              const active = completed || current;

              return (
                <div key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute left-[13px] top-7 h-full w-[2px] ${
                        index < currentStep ? "bg-[var(--color-gold)]" : "bg-slate-300"
                      }`}
                    />
                  )}

                  <div className="relative z-10 h-7 w-7">
                    {current && shouldAnimate && (
                      <span className="absolute inset-0 rounded-full bg-[var(--color-gold)] opacity-20 scale-[1.6] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    )}

                    <div
                      className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 ${
                        active
                          ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-white"
                          : "border-slate-300 bg-white text-slate-300"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm ${
                        active ? "font-medium text-[var(--color-navy)]" : "text-[var(--color-muted)]"
                      }`}
                    >
                      {step.label}
                    </p>

                    {current && shouldAnimate && (
                      <p className="mt-1 text-xs text-[var(--color-muted)]">Estado actualizado automáticamente</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-[#EAC77E] bg-[#FFF8E8] px-4 py-4 text-left text-sm text-[#7A4A00]">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />

            <div className="min-w-0">
              <p className="font-medium">Seguimiento guardado</p>
              <p className="mt-1 leading-6">
                Puede solicitar otro documento y volver al listado sin perder este seguimiento. Si mantiene esta
                pantalla abierta, actualizaremos el estado automáticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex min-w-0 items-center justify-center gap-2 text-xs text-[var(--color-muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-navy)]" />
          <span className="min-w-0 break-words">Actualizando estado automáticamente</span>
        </div>

        <a
          href={`/c/${slug}`}
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--color-cream-input)] text-sm font-medium text-[var(--color-navy)] transition hover:bg-[#EDE8DD]"
        >
          Solicitar otro documento
        </a>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <form onSubmit={submit} className="space-y-5">
        {fields.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Este documento no requiere información adicional.</p>
        ) : (
          fields.map((field) => (
            <FormField key={field.id} label={field.label} required={field.required}>
              {field.field_type === "textarea" ? (
                <Textarea
                  required={field.required}
                  rows={3}
                  placeholder={field.placeholder ?? ""}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                />
              ) : field.field_type === "select" ? (
                <Select
                  required={field.required}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                >
                  <option value="">Seleccione</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  type={getInputType(field.field_type)}
                  required={field.required}
                  placeholder={field.placeholder ?? ""}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                />
              )}
            </FormField>
          ))
        )}

        <div className="rounded-xl border border-[#EAC77E] bg-[#FFF8E8] px-4 py-3 text-sm text-[#7A4A00]">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="min-w-0 break-words">
              Después de enviar verá una pantalla de seguimiento con el estado actualizado automáticamente.
            </p>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="h-12 w-full">
          {submitting ? "Enviando..." : "Enviar solicitud"}
        </Button>
      </form>
    </Card>
  );
}
