import Button from '../../../components/ui/Button.jsx';
import MedicineCard from './MedicineCard.jsx';

export default function MedicineList({ medicines, query, onClearSearch }) {
  if (medicines.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <div className="empty-illustration" aria-hidden="true">
          <svg viewBox="0 0 180 190" fill="none">
            <path d="M39 139h91l-7 28H48l-9-28Z" fill="var(--color-brand-pebble-grey)" />
            <path d="M52 139V81c0-8 6-14 14-14h36c8 0 14 6 14 14v58" fill="var(--color-brand-surface)" stroke="var(--color-brand-burgundy-red)" strokeWidth="2" />
            <path d="M61 67V51h47v16M66 88h36M71 101h27" stroke="var(--color-brand-burgundy-red)" strokeWidth="2" strokeLinecap="round" />
            <path d="M89 129c0-20-2-39-12-56M89 104c2-15 10-25 23-29M82 91c-7-9-16-12-26-10M90 118c8-12 18-17 30-15" stroke="var(--color-brand-steel-blue)" strokeWidth="2" strokeLinecap="round" />
            <path d="M78 76c-1-10-7-16-17-17 0 10 6 16 17 17ZM112 77c1-10 7-16 17-17 0 10-6 16-17 17ZM59 82c-9-3-16 0-21 8 9 4 16 1 21-8ZM119 104c8-7 16-8 24-3-5 9-13 10-24 3Z" fill="var(--color-brand-mist-green)" stroke="var(--color-brand-steel-blue)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M32 174h116" stroke="var(--color-brand-steel-blue)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
        <div className="empty-copy">
          <span className="eyebrow">Un espacio para empezar</span>
          <h3 className="font-display text-3xl font-medium text-brand-text">
            {query ? 'Todavía no aparece.' : 'El botiquín empieza acá.'}
          </h3>
          <p>
            {query ? `No encontramos “${query}”. Probá con otro nombre.` : 'No hay medicamentos en la fuente publicada de Google Sheets.'}
          </p>
          {query ? (
            <Button className="mt-5" variant="secondary" onClick={onClearSearch}>Limpiar búsqueda</Button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4" aria-label="Inventario de medicamentos">
      <div className="medicine-grid grid grid-cols-1 gap-4 min-[960px]:grid-cols-2">
        {medicines.map((medicine) => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
          />
        ))}
      </div>
    </section>
  );
}
