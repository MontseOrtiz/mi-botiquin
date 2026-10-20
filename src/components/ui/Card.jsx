export default function Card({ as: Element = 'article', className = '', ...props }) {
  return (
    <Element
      className={`rounded-lg border border-fog-gray bg-paper-white p-5 ${className}`}
      {...props}
    />
  );
}
