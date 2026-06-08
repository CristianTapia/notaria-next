export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="text-sm font-medium text-[var(--color-gold)]">{eyebrow}</p>}

      <div className="mt-2 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-normal sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 break-words text-sm text-[var(--color-muted)]">{description}</p>}
        </div>

        {children && <div className="min-w-0 w-full sm:w-auto sm:shrink-0">{children}</div>}
      </div>
    </header>
  );
}
