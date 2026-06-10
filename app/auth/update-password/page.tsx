"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScrollText } from "lucide-react";
import { Button, FormField, Input } from "@/components/ui";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadSessionFromHash = async () => {
      const hash = window.location.hash;

      if (!hash) {
        setReady(true);
        return;
      }

      const params = new URLSearchParams(hash.replace("#", ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Sesión iniciada");

        window.history.replaceState(null, "", window.location.pathname);
      }

      setReady(true);
    };

    loadSessionFromHash();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Contraseña actualizada");
    router.push("/dashboard");
  };

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center px-4 text-center">Preparando sesión...</main>;
  }

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

            <h1 className="break-words text-3xl font-normal">Crear contraseña</h1>

            <p className="mt-2 break-words text-sm text-[var(--color-muted)]">
              Define una contraseña para acceder al panel.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <FormField label="Nueva contraseña" required>
              <Input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
            </FormField>

            <Button disabled={busy} className="h-12 w-full">
              {busy ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
