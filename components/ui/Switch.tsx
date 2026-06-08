export function Switch({
  checked,
  disabled,
  onClick,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-w-0 items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full p-0.5 transition ${
          checked ? "bg-[#D99027]/70" : "bg-slate-300"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>

      {label && <span className="min-w-0 break-words text-sm text-[var(--color-muted)]">{label}</span>}
    </button>
  );
}
