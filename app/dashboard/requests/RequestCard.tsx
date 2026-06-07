import { Clock } from "lucide-react";

import { Badge, Card } from "@/components/ui";
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

function formatRequestDate(date: string) {
  const parsedDate = new Date(date);

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export default function RequestCard({ request }: { request: RequestRow }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="break-words text-base font-medium">{request.documents?.title ?? "Documento"}</h2>

          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatRequestDate(request.created_at)}</span>
          </div>
        </div>

        <Badge variant={STATUS_BADGE_VARIANT[request.status] ?? "neutral"}>
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Object.entries(request.data).map(([key, value]) => (
            <div key={key} className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{key}</p>
              <p className="mt-1 break-words text-sm">{String(value || "—")}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
