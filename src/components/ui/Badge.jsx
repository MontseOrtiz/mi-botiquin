const toneClasses = {
  green: 'bg-expiry-green-bg text-expiry-green-fg',
  yellow: 'bg-expiry-yellow-bg text-expiry-yellow-fg',
  red: 'bg-expiry-red-bg text-expiry-red-fg',
};

export default function Badge({ tone = 'green', className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] ${toneClasses[tone] ?? toneClasses.green} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
