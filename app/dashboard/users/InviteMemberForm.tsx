"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";

import { Button, Input } from "@/components/ui";
import { inviteTenantMember, type InviteTenantMemberState } from "./actions";

const initialState: InviteTenantMemberState = {
  ok: false,
  message: "",
};

export default function InviteMemberForm() {
  const [state, formAction, pending] = useActionState(inviteTenantMember, initialState);

  return (
    <form action={formAction}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Invitar funcionario</p>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <Input
          name="email"
          type="email"
          required
          disabled={pending}
          placeholder="correo@ejemplo.com"
          className="min-w-0 flex-1"
        />

        <Button disabled={pending} className="w-full sm:w-auto">
          <Mail className="h-4 w-4" />
          {pending ? "Invitando..." : "Invitar"}
        </Button>
      </div>

      {state.message && (
        <p className={`mt-3 text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>
      )}
    </form>
  );
}
