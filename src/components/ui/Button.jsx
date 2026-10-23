const variantClasses = {
  primary: 'border border-brand-primary bg-brand-primary text-brand-surface hover:bg-brand-primary-hover hover:border-brand-primary-hover',
  secondary: 'border border-brand-sky-blue bg-brand-sky-blue text-brand-text hover:bg-brand-mist-green hover:border-brand-mist-green',
  ghost: 'border border-transparent bg-transparent text-brand-text-muted hover:text-brand-primary',
};

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant] ?? variantClasses.primary} ${className}`}
      type={type}
      {...props}
    />
  );
}
