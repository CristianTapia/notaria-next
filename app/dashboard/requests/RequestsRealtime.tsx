"use client";

import { useEffect } from "react";

import { supabase } from "@/lib/supabase";

export default function RequestsRealtime({
  tenantId,
  onNewRequest,
}: {
  tenantId: string;
  onNewRequest?: (requestId: string) => void;
}) {
  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-requests-highlight-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "document_requests",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const requestId = typeof payload.new?.id === "string" ? payload.new.id : null;

          if (requestId) {
            onNewRequest?.(requestId);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, onNewRequest]);

  return null;
}
