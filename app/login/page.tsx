"use client";

import { useState } from "react";
import { Eye, EyeOff, ScrollText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, FormField, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Sesión iniciada");
    router.push("/dashboard");
  };

  const resetPassword = async () => {
    if (!email) {
      toast.error("Escribe tu correo primero");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Te enviamos un correo para recuperar tu contraseña");
  };

  return (
    <main className="min-h-screen overflow-x-hidden px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-center sm:max-w-md">
        <form
          onSubmit={submit}
          className="w-full max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--color-border)] bg-white/80 p-4 shadow-[0_22px_60px_rgba(7,27,58,0.10)] sm:max-w-md sm:p-8"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
              <ScrollText className="h-5 w-5" />
            </div>

            <h1 className="break-words text-3xl font-normal">Acceso notario</h1>

            <p className="mt-2 break-words text-sm text-[var(--color-muted)]">Panel de administración</p>
          </div>

          <div className="mt-8 space-y-5">
            <FormField label="Correo electrónico" required>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>

            <FormField label="Contraseña" required>
              <div className="relative min-w-0">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-navy)]"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </FormField>

            <Button
              disabled={busy}
              className="h-12 w-full"
            >
              {busy ? "Entrando..." : "Entrar"}
            </Button>
          </div>

          <button
            type="button"
            onClick={resetPassword}
            className="mt-6 w-full text-center text-sm break-words text-[var(--color-muted)] underline-offset-4 transition hover:text-[var(--color-navy)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </main>
  );
}
