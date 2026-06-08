export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-[var(--color-border)] bg-white/80 p-4 shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}
