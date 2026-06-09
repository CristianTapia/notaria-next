"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Card } from "./Card";

export function CollapsibleCard({
  title,
  subtitle,
  children,
  defaultOpen = false,
  variant = "card",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: "card" | "inline";
}) {
  const [open, setOpen] = useState(defaultOpen);

  const content = (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{title}</h3>

          {subtitle && <p className="mt-1 text-xs text-[var(--color-muted)]">{subtitle}</p>}
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--color-muted)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${open ? "mt-4 max-h-[1000px]" : "max-h-0"}`}>
        {children}
      </div>
    </>
  );

  if (variant === "inline") {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-input)] p-4">{content}</div>
    );
  }

  return <Card>{content}</Card>;
}
