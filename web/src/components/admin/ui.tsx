'use client';

export const inputClass =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-[15px] text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-black disabled:bg-muted',
  secondary: 'border border-line bg-white text-ink hover:border-ink',
  danger: 'border border-[#E3B8B0] bg-white text-[#A3341F] hover:border-[#A3341F]',
  ghost: 'text-ink hover:bg-chip',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  );
}

export function FieldShell({
  label,
  help,
  error,
  htmlFor,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {help ? <p className="text-xs text-muted">{help}</p> : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-[#A3341F]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Notice({ kind, children }: { kind: 'success' | 'error'; children: React.ReactNode }) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded-md border px-4 py-3 text-sm ${
        kind === 'error' ? 'border-[#E3B8B0] bg-[#FBEFEC] text-[#7A2716]' : 'border-[#B5D6C3] bg-[#EEF7F1] text-[#14532D]'
      }`}
    >
      {children}
    </div>
  );
}
