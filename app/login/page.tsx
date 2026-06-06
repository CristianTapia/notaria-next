"use client";

import { useState } from "react";
import { Eye, EyeOff, ScrollText } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const resetPassword = async () => {
    if (!email) {
      alert("Escribe tu correo primero");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Te enviamos un correo para recuperar tu contraseña");
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col items-center justify-center">
        <form
          onSubmit={submit}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-white/80 p-8 shadow-[0_22px_60px_rgba(7,27,58,0.10)]"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
              <ScrollText className="h-5 w-5" />
            </div>

            <h1 className="text-[2rem] font-normal tracking-[-0.03em]">Acceso notario</h1>

            <p className="mt-2 text-sm text-[var(--color-muted)]">Panel de administración</p>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Correo electrónico</label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Contraseña</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 pr-11 text-sm outline-none transition focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10"
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
            </div>

            <button
              disabled={busy}
              className="h-12 w-full rounded-lg bg-[var(--color-navy)] text-sm font-medium text-white transition hover:bg-[var(--color-navy-soft)] disabled:opacity-60"
            >
              {busy ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <button
            type="button"
            onClick={resetPassword}
            className="mt-6 w-full text-center text-sm text-[var(--color-muted)] underline-offset-4 transition hover:text-[var(--color-navy)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </main>
  );
}
