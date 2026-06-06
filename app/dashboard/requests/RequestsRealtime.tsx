"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RequestsRealtime({ tenantId }: { tenantId: string }) {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-requests-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "document_requests",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log("REQUEST REALTIME PAYLOAD", payload);
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, router]);

  return null;
}
