export default function Input({ id, label, error, className = '', ...props }) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="grid gap-2">
      <label className="eyebrow" htmlFor={id}>
        {label}
      </label>
      <input
        className={`min-h-12 rounded-xl border border-brand-divider bg-brand-surface/70 px-4 py-3 text-base text-brand-text placeholder:text-brand-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary aria-[invalid=true]:border-brand-primary ${className}`}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p className="text-base text-brand-primary" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
