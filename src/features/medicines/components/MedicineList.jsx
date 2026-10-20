import Button from '../../../components/ui/Button.jsx';
import MedicineCard from './MedicineCard.jsx';

export default function MedicineList({ medicines, query, onAdd, onClearSearch, onEdit, onDelete, onDecrement, busy }) {
  if (medicines.length === 0) {
    return (
      <section className="rounded-xl bg-mist-gray p-5" aria-live="polite">
        <h2 className="text-2xl font-normal">
          {query ? 'No encontramos coincidencias' : 'Todavía no hay medicamentos'}
        </h2>
        <p className="mt-2 text-base text-steel-gray">
          {query ? `No hay resultados para “${query}”.` : 'Agregá los medicamentos de tu botiquín para tenerlos a mano.'}
        </p>
        {query ? (
          <Button className="mt-4" variant="secondary" onClick={onClearSearch}>
            Limpiar búsqueda
          </Button>
        ) : (
          <Button className="mt-4" onClick={() => onAdd()}>
            Agregar medicamento
          </Button>
        )}
      </section>
    );
  }

  return (
    <section className="grid gap-4" aria-label="Inventario de medicamentos">
      <div className="grid gap-4">
        {medicines.map((medicine) => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
            onEdit={onEdit}
            onDelete={onDelete}
            onDecrement={onDecrement}
            busy={busy}
          />
        ))}
      </div>
    </section>
  );
}
