"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { saveClientRequest } from "@/lib/client-requests-storage";

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

export default function ClientDocumentForm({ doc, fields, slug }: { doc: Doc; fields: Field[]; slug: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [requestId, setRequestId] = useState<string | null>(null);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");

  const refreshCurrentRequest = async () => {
    if (!requestId || !trackingToken) return;

    console.log("polling request", requestId);

    const { data, error } = await supabase.rpc("get_client_document_requests", {
      p_requests: [
        {
          request_id: requestId,
          tracking_token: trackingToken,
        },
      ],
    });

    console.log("polling result", {
      statusFromRpc: data?.[0]?.status,
      fullRow: data?.[0],
      error,
    });

    if (error) return;

    const current = data?.[0];
    if (!current) return;

    setStatus(current.status ?? "pending");
  };

  useEffect(() => {
    if (!requestId || !trackingToken) return;

    const intervalId = window.setInterval(() => {
      refreshCurrentRequest();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [requestId, trackingToken]);

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
      alert(error.message);
      return;
    }

    const request = inserted?.[0];

    if (!request) {
      alert("No se pudo obtener la solicitud creada.");
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
    return (
      <div className="mt-8 rounded-2xl border p-6 text-center">
        <p className="text-sm text-gray-500">Estado actual</p>
        <h2 className="mt-2 text-2xl font-bold">{status}</h2>
        <p className="mt-2 text-gray-500">Su solicitud fue enviada correctamente.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5 border rounded-2xl p-6">
      {fields.length === 0 ? (
        <p className="text-sm text-gray-500">Este documento no requiere información adicional.</p>
      ) : (
        fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium mb-1.5">
              {field.label}
              {field.required && <span className="ml-1">*</span>}
            </label>

            {field.field_type === "textarea" ? (
              <textarea
                required={field.required}
                rows={3}
                placeholder={field.placeholder ?? ""}
                value={values[field.id] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            ) : field.field_type === "select" ? (
              <select
                required={field.required}
                value={values[field.id] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Seleccione</option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={
                  field.field_type === "email"
                    ? "email"
                    : field.field_type === "phone"
                      ? "tel"
                      : field.field_type === "number"
                        ? "number"
                        : field.field_type === "date"
                          ? "date"
                          : "text"
                }
                required={field.required}
                placeholder={field.placeholder ?? ""}
                value={values[field.id] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            )}
          </div>
        ))
      )}

      <button type="submit" disabled={submitting} className="w-full rounded-md bg-black text-white py-3 font-medium">
        {submitting ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
