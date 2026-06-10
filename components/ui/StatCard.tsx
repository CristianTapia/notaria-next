import { Card } from "./Card";

export function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[var(--color-muted)]">{title}</p>
          <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">{value}</p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">{description}</p>
        </div>

        {icon && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
