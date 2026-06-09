export function DataGrid({
  items,
}: {
  items: Array<{
    label: string;
    value: React.ReactNode;
  }>;
}) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white/70">
      <div className="grid grid-cols-[0.9fr_1.1fr] border-b border-[var(--color-border)] bg-[var(--color-cream-input)] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        <span>Campo</span>
        <span>Valor</span>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-[0.9fr_1.1fr] gap-3 px-4 py-3 text-sm">
            <p className="min-w-0 break-words text-[var(--color-muted)]">{item.label}</p>

            <div className="min-w-0 break-words font-medium">{item.value || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
