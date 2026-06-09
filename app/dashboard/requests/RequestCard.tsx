import { CalendarDays, Clock } from "lucide-react";

import { Badge, Card, DataGrid } from "@/components/ui";
import RequestStatusSelect from "./RequestStatusSelect";

type RequestStatus = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

type RequestRow = {
  id: string;
  status: RequestStatus;
  data: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  documents: {
    title: string;
  } | null;
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pendiente",
  in_progress: "En proceso",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_BADGE_VARIANT: Record<RequestStatus, "gold" | "blue" | "green" | "neutral" | "red"> = {
  pending: "gold",
  in_progress: "blue",
  ready: "green",
  delivered: "neutral",
  cancelled: "red",
};

const STATUS_ACCENT: Record<RequestStatus, string> = {
  pending: "border-l-4 border-l-[var(--color-gold)]",
  in_progress: "border-l-4 border-l-sky-500",
  ready: "border-l-4 border-l-emerald-500",
  delivered: "",
  cancelled: "",
};

function formatRequestDateParts(date: string) {
  const parsedDate = new Date(date);

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${minutes}`,
  };
}

export default function RequestCard({
  request,
  isNew = false,
  now,
}: {
  request: RequestRow;
  isNew?: boolean;
  now: number;
}) {
  const dateParts = formatRequestDateParts(request.created_at);
  const needsAttention = request.status === "pending";
  const waitingMinutes = Math.max(0, Math.floor((now - new Date(request.created_at).getTime()) / (1000 * 60)));
  const isLongWaiting = needsAttention && waitingMinutes >= 15;

  return (
    <Card
      className={`relative overflow-hidden transition ${STATUS_ACCENT[request.status]} ${
        needsAttention
          ? isLongWaiting
            ? "shadow-[0_0_0_1px_rgba(239,68,68,0.22),0_0_30px_rgba(239,68,68,0.10)]"
            : "shadow-[0_0_0_1px_rgba(217,144,39,0.18),0_0_24px_rgba(217,144,39,0.08)]"
          : ""
      } ${isNew ? "border-red-300 bg-red-50/60 shadow-[0_0_0_4px_rgba(239,68,68,0.10)]" : ""}`}
    >
      {isNew && (
        <div className="pointer-events-none absolute right-4 top-4">
          <span className="absolute inset-0 h-3 w-3 rounded-full bg-red-500 opacity-30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <span className="relative block h-3 w-3 rounded-full bg-red-500" />
        </div>
      )}

      {needsAttention && !isNew && (
        <div className="pointer-events-none absolute right-4 top-4">
          <span className="absolute inset-0 h-3 w-3 rounded-full bg-[var(--color-gold)] opacity-30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <span className="relative block h-3 w-3 rounded-full bg-[var(--color-gold)]" />
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words text-base font-medium">{request.documents?.title ?? "Documento"}</h2>

            {isNew && (
              <Badge variant="red" className="shrink-0">
                Nueva
              </Badge>
            )}

            {needsAttention && !isNew && (
              <Badge variant="gold" className="shrink-0 animate-pulse">
                Sin tomar
              </Badge>
            )}

            {isLongWaiting && (
              <Badge variant="red" className="shrink-0 animate-pulse">
                {waitingMinutes} min esperando
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {dateParts.date}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {dateParts.time}
            </span>
          </div>
        </div>

        <Badge variant={STATUS_BADGE_VARIANT[request.status] ?? "neutral"} className="w-fit">
          {STATUS_LABEL[request.status] ?? request.status}
        </Badge>
      </div>

      <div className="mt-4">
        <RequestStatusSelect
          key={`${request.id}-${request.status}`}
          requestId={request.id}
          initialStatus={request.status}
        />
      </div>

      {request.data && (
        <div className="mt-4">
          <DataGrid
            items={Object.entries(request.data).map(([key, value]) => ({
              label: key,
              value: String(value || "—"),
            }))}
          />
        </div>
      )}
    </Card>
  );
}
