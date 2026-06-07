type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-soft)]",
  secondary: "border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-cream-input)]",
  danger: "border border-red-200 text-red-600 hover:bg-red-50",
  ghost: "text-[var(--color-muted)] hover:bg-[var(--color-cream-input)] hover:text-[var(--color-navy)]",
  icon: "h-11 w-11 shrink-0 px-0 text-[var(--color-muted)] hover:bg-[var(--color-cream-input)] hover:text-[var(--color-navy)]",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  const isIcon = variant === "icon";

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isIcon ? "" : "h-10 px-4"
      } ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
