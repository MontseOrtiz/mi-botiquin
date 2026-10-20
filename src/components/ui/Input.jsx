export default function Input({ id, label, error, className = '', ...props }) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="grid gap-2">
      <label className="text-base text-ink-black" htmlFor={id}>
        {label}
      </label>
      <input
        className={`min-h-12 rounded-lg border border-fog-gray bg-paper-white px-4 py-3 text-base text-ink-black placeholder:text-steel-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt-violet aria-[invalid=true]:border-expiry-red ${className}`}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p className="text-base text-expiry-red" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
