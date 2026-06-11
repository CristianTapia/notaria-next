"use client";

import { useRequestsSoundPreference } from "@/hooks/useRequestsSoundPreference";
import DashboardRealtime from "./DashboardRealtime";

export default function DashboardRealtimeWithSound({ tenantId }: { tenantId: string }) {
  const soundEnabled = useRequestsSoundPreference();

  return <DashboardRealtime tenantId={tenantId} soundEnabled={soundEnabled} />;
}
