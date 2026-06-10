"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { useActionToast } from "@/hooks/useActionToast";
import { Button, FormField, Input } from "@/components/ui";
import { inviteTenantMember, type InviteTenantMemberState } from "./actions";

const initialState: InviteTenantMemberState = {
  ok: false,
  message: "",
};

export default function InviteMemberForm() {
  const [state, formAction, pending] = useActionState(inviteTenantMember, initialState);
  useActionToast(state);

  return (
    <form action={formAction}>
      <FormField label="Correo" description="Se enviará una invitación al funcionario." required>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            className="min-w-0 flex-1"
            name="email"
            type="email"
            disabled={pending}
            placeholder="correo@ejemplo.com"
          />
          <Button disabled={pending} className="w-full sm:w-auto">
            <Mail className="h-4 w-4" />
            {pending ? "Invitando..." : "Invitar"}
          </Button>
        </div>
      </FormField>
    </form>
  );
}
