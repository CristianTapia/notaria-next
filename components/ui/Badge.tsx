type BadgeVariant = "gold" | "green" | "red" | "blue" | "neutral" | "navy";

const variants: Record<BadgeVariant, string> = {
  gold: "bg-[#F5E9D6] text-[var(--color-navy)]",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  neutral: "bg-slate-100 text-slate-600",
  navy: "bg-[var(--color-navy)] text-white",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
