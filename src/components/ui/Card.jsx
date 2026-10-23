export default function Card({ as: Element = 'article', className = '', ...props }) {
  return (
    <Element
      className={`rounded-2xl border border-brand-divider bg-brand-surface p-5 sm:p-6 ${className}`}
      {...props}
    />
  );
}
