const variantClasses = {
  primary: 'border border-bolt-violet bg-bolt-violet text-paper-white hover:brightness-95',
  secondary: 'border border-bolt-violet bg-paper-white text-bolt-violet hover:bg-mist-gray',
  ghost: 'border border-transparent bg-transparent text-ink-black hover:text-bolt-violet',
};

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt-violet disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant] ?? variantClasses.primary} ${className}`}
      type={type}
      {...props}
    />
  );
}
