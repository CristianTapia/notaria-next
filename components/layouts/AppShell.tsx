"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/dashboard") return pathname === "/dashboard";

  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClass(active: boolean) {
  return `flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    active ? "bg-white text-[var(--color-navy)] shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"
  }`;
}

export default function AppShell({
  title,
  subtitle,
  email,
  navItems,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  email?: string | null;
  navItems: NavItem[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-[var(--color-navy)] px-4 text-white md:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <div className={`fixed inset-0 z-50 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />

        <aside
          className={`relative flex h-full w-[280px] max-w-[85vw] flex-col bg-[var(--color-navy)] text-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-start justify-between border-b border-white/10 p-5">
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{title}</p>
              {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white shadow-sm transition hover:bg-white/20"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={navItemClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {(email || footer) && (
            <div className="border-t border-white/10 p-4">
              {email && (
                <div className="mb-3 rounded-xl bg-white/5 p-3">
                  <p className="truncate text-xs text-white/50">Sesión iniciada</p>
                  <p className="mt-1 truncate text-sm">{email}</p>
                </div>
              )}

              {footer}
            </div>
          )}
        </aside>
      </div>

      <div className="flex h-[calc(100vh-4rem)] min-w-0 md:h-screen">
        <aside className="hidden h-screen w-72 shrink-0 flex-col bg-[var(--color-navy)] text-white md:flex">
          <div className="border-b border-white/10 p-6">
            <h1 className="text-lg font-medium">{title}</h1>
            {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="min-w-0 break-words">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {(email || footer) && (
            <div className="border-t border-white/10 p-4">
              {email && (
                <div className="mb-3 rounded-xl bg-white/5 p-3">
                  <p className="truncate text-xs text-white/50">Sesión iniciada</p>
                  <p className="mt-1 truncate text-sm">{email}</p>
                </div>
              )}

              {footer}
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto min-w-0 max-w-7xl px-3 py-4 sm:px-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
