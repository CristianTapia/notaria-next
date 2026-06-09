"use client";

import { useState } from "react";
import { Switch } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function DocumentActiveToggle({
  documentId,
  initialActive,
}: {
  documentId: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const previousActive = active;
    const nextActive = !active;

    setActive(nextActive);
    setSaving(true);

    const { error } = await supabase.from("documents").update({ active: nextActive }).eq("id", documentId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      setActive(previousActive);
      return;
    }

    toast.success(nextActive ? "Documento visible" : "Documento oculto");
  };

  return (
    <Switch
      checked={active}
      disabled={saving}
      loading={saving}
      onClick={toggle}
      label={active ? "Visible" : "Oculto"}
    />
  );
}
