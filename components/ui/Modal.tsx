"use client";

import { X } from "lucide-react";

const SIZE_CLASS = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  icon,
  size = "md",
  disableClose = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  disableClose?: boolean;
}) {
  if (!open) return null;

  const hasIcon = Boolean(icon);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3 sm:place-items-center">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (disableClose) return;
          onClose();
        }}
      />

      <div
        className={`relative w-full ${SIZE_CLASS[size]} rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl sm:p-5`}
      >
        <div className={hasIcon ? "text-center" : "flex items-start justify-between gap-4"}>
          {hasIcon ? (
            <>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
                {icon}
              </div>

              <h2 className="mt-5 break-words text-xl font-medium tracking-[-0.02em] text-[var(--color-navy)]">
                {title}
              </h2>

              {description && (
                <p className="mx-auto mt-2 max-w-sm break-words text-sm leading-6 text-[var(--color-muted)]">
                  {description}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="min-w-0">
                <h2 className="break-words text-lg font-medium">{title}</h2>

                {description && <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (disableClose) return;
                  onClose();
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-cream-input)] text-[var(--color-muted)] transition hover:text-[var(--color-navy)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cerrar"
                disabled={disableClose}
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {hasIcon && <div className="mx-auto mt-5 h-px max-w-xs bg-[var(--color-border)]" />}

        <div className={hasIcon ? "mt-5" : "mt-5"}>{children}</div>
      </div>
    </div>
  );
}
