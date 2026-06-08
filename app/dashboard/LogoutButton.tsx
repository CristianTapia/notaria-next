"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-sm
        text-white/80
        transition
        hover:bg-white/10
        hover:text-white
      "
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span>Cerrar sesión</span>
    </button>
  );
}
