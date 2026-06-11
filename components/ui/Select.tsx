export function Select({ className = "", children, value, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const isPlaceholder = value === "" || value === undefined || value === null;

  return (
    <select
      {...props}
      value={value}
      className={`
        min-h-11 w-full min-w-0 rounded-lg border border-[#DCD5C7]
        bg-[var(--color-cream-input)] px-3 py-2 text-sm outline-none transition
        focus:border-[var(--color-navy)]
        focus:ring-4 focus:ring-[var(--color-navy)]/10
        disabled:cursor-not-allowed disabled:opacity-60
        ${isPlaceholder ? "text-[var(--color-muted)]" : "text-[var(--color-navy)]"}
        ${className}
      `}
    >
      {children}
    </select>
  );
}
