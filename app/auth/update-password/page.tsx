"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
          alert(error.message);
        }

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
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  };

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center px-4 text-center">Preparando sesión...</main>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border p-4 sm:p-6">
        <h1 className="break-words text-2xl font-bold">Crear contraseña</h1>

        <input
          type="password"
          required
          minLength={6}
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        />

        <button disabled={busy} className="w-full rounded-md bg-black py-2 text-white">
          {busy ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </main>
  );
}
