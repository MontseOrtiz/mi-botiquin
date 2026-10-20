const toneClasses = {
  green: 'bg-expiry-green/10 text-expiry-green',
  yellow: 'bg-expiry-yellow/10 text-expiry-yellow',
  red: 'bg-expiry-red/10 text-expiry-red',
};

export default function Badge({ tone = 'green', className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 text-base ${toneClasses[tone] ?? toneClasses.green} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
