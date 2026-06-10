export function FormField({
  label,
  description,
  required,
  className = "",
  children,
}: {
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`min-w-0 space-y-2 ${className}`}>
      <div>
        <label className="block break-words text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-[var(--color-gold)]">*</span>}
        </label>

        {description && <p className="mt-1 break-words text-xs text-[var(--color-muted)]">{description}</p>}
      </div>

      {children}
    </div>
  );
}
