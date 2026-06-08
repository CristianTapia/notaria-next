export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full min-w-0 rounded-lg border border-[#DCD5C7] bg-[var(--color-cream-input)] px-3 py-2 text-sm outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-navy)] focus:ring-4 focus:ring-[var(--color-navy)]/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}
